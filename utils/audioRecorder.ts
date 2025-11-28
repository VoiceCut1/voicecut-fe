import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AudioRecorderPlayer 객체 생성
const audioRecorderPlayer = new AudioRecorderPlayer();

// 현재 녹음 데이터 관리 변수
let currentRecordingUri: string | null = null;

/**
 * 녹음을 시작하는 함수
 */
export const startRecording = async (
  updateRecordingState: (state: boolean) => void,
): Promise<void> => {
  try {
    console.log('녹음 시작 준비 중...');

    // 녹음 시작
    currentRecordingUri = await audioRecorderPlayer.startRecorder();
    console.log('녹음 시작됨. URI:', currentRecordingUri);

    // 녹음 상태 true로 업데이트
    updateRecordingState(true);

    // 녹음 중 진행 상태를 모니터링하기 위해 이벤트 리스너 추가
    audioRecorderPlayer.addRecordBackListener(async e => {
      console.log('녹음 중 현재 위치(ms):', e.currentPosition);

      // 현재 녹음 시간이 10초(10,000ms) 이상이면 중지
      if (e.currentPosition >= 10000) {
        console.log('녹음 10초 초과, 녹음 종료 중...');
        await stopRecording(updateRecordingState); // 녹음을 중단
      }
    });
  } catch (error) {
    console.error('녹음 시작 중 오류:', error);
  }
};

/**
 * 녹음을 중단하는 함수
 */
export const stopRecording = async (
  updateRecordingState: (state: boolean) => void,
): Promise<void> => {
  try {
    if (!currentRecordingUri) {
      console.warn('현재 진행 중인 녹음이 없습니다.');
      return;
    }

    console.log('녹음 중단 시도 중...');

    // 녹음 중단 및 데이터 가져오기
    await audioRecorderPlayer.stopRecorder();
    console.log('녹음 중단 완료. URI:', currentRecordingUri);

    // 리스너 제거
    audioRecorderPlayer.removeRecordBackListener();

    // 서버로 파일 업로드
    await uploadVoiceFile(currentRecordingUri);

    // 녹음 데이터 초기화
    currentRecordingUri = null;
    console.log('녹음 데이터 초기화 완료.');

    // 녹음 상태 false로 업데이트
    updateRecordingState(false);
  } catch (error) {
    console.error('녹음 중단 중 오류:', error);
  }
};

/**
 * 음성 데이터를 서버로 업로드하는 함수
 */
const uploadVoiceFile = async (audioUri: string): Promise<void> => {
  try {
    console.log('음성 데이터 업로드 시작. URI:', audioUri);

    const uuid = await AsyncStorage.getItem('elderUuid');
    console.log('불러온 UUID:', uuid);

    if (!uuid) {
      throw new Error('UUID가 없습니다. 녹음 시작 전에 UUID를 발급받으세요.');
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('uuid', uuid);
    formData.append('voiceFile', {
      uri: audioUri,
      name: `voice_${Date.now()}.m4a`,
      type: 'audio/m4a',
    });

    console.log('FormData 내용:', formData);

    // POST 요청
    const response = await fetch(
      'http://54.180.238.147:8080/api/voice-phishing/analysis',
      {
        method: 'POST',
        body: formData,
      },
    );

    console.log('서버 응답 수신', response);

    if (!response.ok) {
      console.error(
        '서버 응답 오류 상태:',
        response.status,
        response.statusText,
      );
      throw new Error(`서버 응답 오류: ${response.status}`);
    }

    if (
      response.status === 200 &&
      response.headers.get('content-length') === '0'
    ) {
      console.log('서버 응답 본문이 비어 있습니다.');
    } else {
      const result = await response.json();
      console.log('서버 응답 데이터:', result);
    }
  } catch (error) {
    console.error(
      '음성 데이터 업로드 실패:',
      error instanceof Error ? error.message : error,
    );
  }
};
