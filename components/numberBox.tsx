import React, {useState} from 'react';
import {Modal, StyleSheet, TouchableOpacity, View, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontText from './fontText';
import {formatNumber} from '../utils/format';

interface NumberBoxProps {
  name: string;
  number: string;
  index: number;
  onDelete: () => void; // 삭제 후 상태 갱신 함수
}

const NumberBox: React.FC<NumberBoxProps> = ({
  name,
  index,
  number,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOnClick = () => {
    setIsOpen(!isOpen);
  };

  const handleDelete = async () => {
    try {
      const storedData = await AsyncStorage.getItem('nok');
      const parsedData = storedData ? JSON.parse(storedData) : [];

      // 전화번호를 기준으로 해당 항목을 삭제
      const updatedData = parsedData.filter(
        (item: {number: string}) => item.number !== number,
      );

      await AsyncStorage.setItem('nok', JSON.stringify(updatedData));
      Alert.alert(
        '삭제 완료',
        `${name} (${number})가 삭제되었습니다.`,
        [{text: '닫기'}],
        {
          cancelable: true,
        },
      );
      onDelete(); // 삭제 후 부모 컴포넌트에서 상태 갱신
      setIsOpen(false); // 모달 닫기
    } catch (error) {
      Alert.alert('오류 발생', '데이터 삭제 중 오류가 발생했습니다.');
    }
  };

  // index에 따라 container 색상 다르게 주기
  const bgColor = index === 1 || index === 2 ? '#FDEEC3' : '#C4F4E8';

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: bgColor}]}
      onPress={handleOnClick}>
      <FontText size={35}>{name}</FontText>

      <Modal
        visible={isOpen}
        onRequestClose={handleOnClick}
        animationType="fade"
        transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalTextBox}>
              <FontText size={45}>{name}</FontText>
              <View style={styles.modalLine}></View>
              <FontText size={50}>{formatNumber(number)}</FontText>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleOnClick}>
                <FontText size={25} color="white">
                  창 닫기
                </FontText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDelete}>
                <FontText size={25} color="white">
                  삭제
                </FontText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#FDEEC3',
    margin: '1%',
    borderRadius: '5%',
    height: '48%',
    width: '48%',
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTextBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalLine: {
    backgroundColor: '#F68E5F',
    height: 2,
    width: '100%',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#F68E5F',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '45%',
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
  },
});

export default NumberBox;
