import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FontText from '../components/fontText';
import NumberList from '../components/numberList';
import {startRecording, stopRecording} from '../utils/audioRecorder';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://54.180.238.147:8080/api/elders';

const MainPage = () => {
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태 관리

  // 녹음 시작/중지 토글 함수
  const handleRecording = async () => {
    if (isRecording) {
      // 녹음 종료
      await stopRecording(setIsRecording);
    } else {
      // 녹음 시작 전 UUID 발급 및 저장
      try {
        const uuid = await requestUuidFromApi();
        await AsyncStorage.setItem('elderUuid', uuid); // UUID 저장
        console.log('발급된 UUID:', uuid);

        // 녹음 시작
        await startRecording(setIsRecording);
      } catch (error) {
        console.error('녹음 시작 중 오류 발생:', error);
        Alert.alert('오류', '녹음을 시작할 수 없습니다. 다시 시도해주세요.');
      }
    }
  };

  const requestUuidFromApi = async () => {
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken'); // 저장된 FCM 토큰 불러오기
      const guardianNumbers = await AsyncStorage.getItem('nok'); // 보호자 번호 불러오기
      const nickname = await AsyncStorage.getItem('name'); // 저장된 닉네임 불러오기

      console.log(fcmToken);
      console.log(guardianNumbers);
      console.log(nickname);

      // 타입 정의
      type GuardianNumber = {
        id: number;
        name: string;
        number: string;
      };

      // 파싱된 데이터에 타입 적용
      const parsedGuardianNumbers: GuardianNumber[] = guardianNumbers
        ? JSON.parse(guardianNumbers)
        : [];

      // 전화번호에서 '-' 제거
      const guardianNumbersArray = parsedGuardianNumbers.map(
        (item: GuardianNumber) => item.number.replace(/-/g, ''), // '-' 제거
      );
      console.log(guardianNumbersArray);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname || '', // nickname이 null일 경우 빈 문자열
          fcmToken: fcmToken || '', // fcmToken이 null일 경우 빈 문자열
          guardianNumbers: guardianNumbersArray, // 숫자 배열
        }),
      });

      const data = await response.json(); // 한번만 호출
      console.log(data);

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${data}`);
      }

      return data.uuid; // 서버로부터 받은 UUID 반환
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      {/* 녹음 컨트롤 버튼 */}
      <TouchableOpacity style={styles.recordButton} onPress={handleRecording}>
        <Text style={styles.recordButtonText}>
          {isRecording ? '녹음 종료' : '녹음 시작'}
        </Text>
      </TouchableOpacity>

      <Image
        source={require('../assets/img/shield.png')}
        style={styles.image}
      />
      <FontText size={40}>
        보이스피싱{'\n'}
        <Text style={styles.orangeText}>탐지중</Text>
      </FontText>

      <View style={styles.whiteBox}>
        <FontText size={35} color="#324376">
          등록 보호자
        </FontText>
        <NumberList />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
    paddingTop: '25%',
  },
  orangeText: {
    color: '#F68E5F',
  },
  whiteBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: '15%',
    margin: 10,
    padding: '3%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '50%',
    height: '30%',
    position: 'absolute',
    left: '25%',
    top: '5%',
  },
  recordButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainPage;
