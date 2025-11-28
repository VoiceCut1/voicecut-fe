import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  Alert,
} from 'react-native';
import Contacts from 'react-native-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontText from './fontText';
import {formatNumbers} from '../utils/format';

interface RegistryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

const RegistryModal: React.FC<RegistryModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [contactList, setContactList] = useState<
    {name: string; number: string}[]
  >([]);
  const [searchText, setSearchText] = useState('');

  const MAX_NOK = 4;

  // 연락처 가져오기 함수
  const fetchContacts = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: '연락처 접근 권한 요청',
          message: '앱이 연락처에 접근하려면 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const contacts = await Contacts.getAll();
        const formattedContacts = contacts.map(contact => ({
          name: contact.displayName,
          number: contact.phoneNumbers[0]?.number || '번호 없음',
        }));
        setContactList(formattedContacts);
      } else {
        console.log('연락처 접근 권한이 거부되었습니다.');
      }
    } catch (error) {
      console.error('연락처를 가져오는 중 오류 발생:', error);
    }
  };

  // AsyncStorage에서 보호자 목록 가져오기
  const getNok = async () => {
    const storedData = await AsyncStorage.getItem('nok');
    return storedData ? JSON.parse(storedData) : [];
  };

  // AsyncStorage에 보호자 추가
  const saveNok = async (newNok: {name: string; number: string}) => {
    const currentNok = await getNok();

    if (
      currentNok.some((item: {number: string}) => item.number === newNok.number)
    ) {
      Alert.alert('중복된 번호', '이미 등록된 번호입니다.', [{text: '닫기'}], {
        cancelable: true,
      });
      return;
    }

    if (currentNok.length >= MAX_NOK) {
      Alert.alert(
        '최대 인원 초과',
        `최대 ${MAX_NOK}명의 보호자를 추가할 수 있습니다.`,
      );
      return;
    }

    const updatedNok = [...currentNok, newNok];
    await AsyncStorage.setItem('nok', JSON.stringify(updatedNok));
    Alert.alert(
      '등록 완료',
      `${newNok.name} 가 보호자로 등록되었습니다.`,
      [{text: '닫기'}],
      {
        cancelable: true,
      },
    );
    onSave(); // 저장 후 부모 컴포넌트에 변경 알림
    onClose(); // 모달 닫기
  };

  // 모달이 열릴 때 연락처 가져오기
  useEffect(() => {
    if (visible) {
      fetchContacts();
    }
  }, [visible]);

  // 검색 필터 적용
  const filteredContacts = contactList.filter(
    contact =>
      contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.number.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity
        style={styles.modalBackground}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          <FontText color="#324276" size={40} style={{marginTop: 20}}>
            보호자 등록
          </FontText>
          <View style={styles.modalLine}></View>
          <TextInput
            style={styles.input}
            placeholder="검색어를 입력해주세요"
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
          <FlatList
            data={filteredContacts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.numberList}
                onPress={() => saveNok(item)}>
                <FontText size={30} style={{marginTop: 10, textAlign: 'left'}}>
                  {item.name}
                </FontText>
                <FontText
                  size={20}
                  style={{
                    marginTop: 5,
                    color: '#586BA4',
                    textAlign: 'left',
                  }}>
                  {formatNumbers(item.number)}
                </FontText>
              </TouchableOpacity>
            )}
          />
          <View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    height: '90%',
    padding: '5%',
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalLine: {
    backgroundColor: '#F68E5F',
    height: 10,
    width: '95%',
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#324276',
    textAlign: 'center',
  },
  input: {
    width: '90%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#F68E5F',
    color: '#586BA4',
  },
  numberList: {
    width: '100%',
    flexWrap: 'wrap',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: '10%',
  },
  buttonText: {
    color: '#F68E5F',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default RegistryModal;
