import {ParamListBase} from '@react-navigation/native';
import {TextStyle} from 'react-native';

export interface ModalProps {
  visible: boolean;
}

export interface FontTextProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: TextStyle;
}
// 페이지 이동을 위한 인터페이스 정의
export interface StackParamList extends ParamListBase {
  MainPage: undefined;
  NokListPage: undefined;
  SplashPage: undefined;
}
