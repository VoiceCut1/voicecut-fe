/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {Vibration} from 'react-native';

AppRegistry.registerComponent(appName, () => App);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // 진동 패턴 : 진동 500 , 정지 250, 진동 500
  const vibrationPattern = [500, 250, 500];
  // false : 단일 반복
  Vibration.vibrate(vibrationPattern, true);

  console.log('백그라운드에서 알림 수신 확인');

  setTimeout(() => {
    Vibration.cancel();
  }, 5000);
});
