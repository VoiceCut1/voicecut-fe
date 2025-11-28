import {
  Alert,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInputChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import FontText from '../components/fontText';
import {TextInput} from 'react-native-gesture-handler';
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../constans/interface';

const SplashPage = () => {
  type NavigationProp = StackNavigationProp<StackParamList, 'MainPage'>;
  const nav = useNavigation<NavigationProp>();
  const [text, setText] = useState('');
  const [name, setName] = useState<String>();

  // AsyncStorage에서 이름 등록 여부 확인
  useEffect(() => {
    const checkName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('name');

        if (storedName) {
          console.log(storedName);
          setName(storedName);
          // AsyncStorage.clear();
          // console.log('이름 초기화', name);
        } else {
          setName('');
        }
      } catch (error) {
        console.error('이름을 확인하는 데 오류가 발생했습니다.');
      }
    };

    checkName();
  }, [nav]);

  const onChangeText = (
    e: NativeSyntheticEvent<TextInputChangeEventData>,
  ): void => {
    setText(e.nativeEvent.text);
  };

  const onClickButton = async () => {
    const trimmedText = text.trim();
    // 이름 유효성 검사
    if (trimmedText.length === 0 || trimmedText.length > 10) {
      Alert.alert(
        '입력 오류',
        '0자 이상 10자 이내의 이름을 입력해주세요',
        [
          {
            text: '닫기',
          },
        ],
        {
          cancelable: true,
        },
      );
      return;
    }

    // 이름 저장
    await AsyncStorage.setItem('name', JSON.stringify(text));
    setName(trimmedText);
    Alert.alert(
      '등록 완료',
      `${trimmedText}로 이름이 등록되었습니다.`,
      [
        {
          text: '닫기',
          onPress: () => {
            nav.navigate('MainPage');
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  return (
    <View style={styles.container}>
      <FontText size={50} color="black">
        전화대장군
      </FontText>
      {name ? (
        <>
          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 20, marginTop: '3%', marginBottom: '3%'}}>
              {name}님 환영합니다!
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                nav.navigate('MainPage');
              }}>
              <FontText size={20}>시작하기</FontText>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="이름을 입력해주세요"
            maxLength={10}
            onChange={onChangeText}
            value={text}
          />
          <TouchableOpacity style={styles.button} onPress={onClickButton}>
            <FontText size={20}>시작하기</FontText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    width: '30%',
    padding: '4%',
    backgroundColor: '#F68E5F',
    textAlign: 'center',
    borderRadius: '5%',
  },

  input: {
    width: '70%',
    height: 60,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginTop: '10%',
    marginBottom: '5%',
    fontSize: 20,
    borderWidth: 2,
    borderColor: '#F68E5F',
    color: '#586BA4',
  },
});

export default SplashPage;

//
