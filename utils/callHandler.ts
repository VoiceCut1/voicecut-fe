import RNCallKeep from 'react-native-callkeep';
import {PermissionsAndroid, AppState} from 'react-native';
import {startRecording, stopRecording} from './audioRecorder';

export const setupCallKeep = async () => {
  const options = {
    ios: {
      appName: 'VoiceCut',
    },
    android: {
      alertTitle: '권한 요청',
      alertDescription: '이 앱은 전화 접근 권한이 필요합니다.',
      cancelButton: '취소',
      okButton: '확인',
      additionalPermissions: [
        PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ],
      foregroundService: {
        channelId: 'com.voicecut',
        channelName: 'VoiceCut Service',
        notificationTitle: '녹음 중...',
      },
      selfManaged: false, // 기본 전화 앱 통합을 위해 비활성화
    },
  };

  try {
    console.log('RNCallKeep 초기화 시작');

    // AppState 확인
    if (AppState.currentState === 'active') {
      console.log('앱 상태: active');
      await RNCallKeep.setup(options);
      console.log('RNCallKeep setup 성공');
    } else {
      console.warn('앱이 비활성화 상태입니다. RNCallKeep setup을 건너뜁니다.');
      return;
    }

    // 권한 요청
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    console.log('권한 요청 결과:', granted);

    if (
      granted['android.permission.READ_PHONE_NUMBERS'] !==
        PermissionsAndroid.RESULTS.GRANTED ||
      granted['android.permission.RECORD_AUDIO'] !==
        PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.warn('필수 권한이 승인되지 않았습니다.');
      return;
    }

    console.log('모든 필수 권한이 승인되었습니다.');

    // 전화 수신 이벤트 핸들러 등록
    RNCallKeep.addEventListener('answerCall', async data => {
      console.log('전화 수신 이벤트 발생:', data);
      try {
        await startRecording();
        console.log('녹음 시작 성공');
      } catch (error) {
        console.error('녹음 시작 오류:', error);
      }
    });

    // 전화 종료 이벤트 핸들러 등록
    RNCallKeep.addEventListener('endCall', async data => {
      console.log('전화 종료 이벤트 발생:', data);
      try {
        await stopRecording();
        console.log('녹음 종료 성공');
      } catch (error) {
        console.error('녹음 종료 오류:', error);
      }
    });

    // 활성 통화 정보 확인
    const calls = await RNCallKeep.getCalls();
    console.log('현재 활성 통화 정보:', calls);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message?.includes('BIND_TELECOM_CONNECTION_SERVICE')) {
        console.warn(
          'BIND_TELECOM_CONNECTION_SERVICE 권한이 없어 PhoneAccount 등록을 건너뜁니다.',
        );
      } else if (error.message?.includes('E_ACTIVITY_DOES_NOT_EXIST')) {
        console.warn(
          'React Native Activity가 존재하지 않습니다. setupCallKeep를 나중에 호출하세요.',
        );
      } else {
        console.error('RNCallKeep 초기화 오류:', error);
      }
    } else {
      console.error('알 수 없는 오류 발생:', error);
    }
  }
};

// 권한 확인 함수
const checkPermissions = async () => {
  const readPhoneNumbersGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
  );
  const recordAudioGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );

  console.log('READ_PHONE_NUMBERS 권한:', readPhoneNumbersGranted);
  console.log('RECORD_AUDIO 권한:', recordAudioGranted);
};

// setupCallKeep를 호출하기 전에 권한 확인
checkPermissions();
