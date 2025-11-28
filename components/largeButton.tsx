import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import FontText from './fontText';

interface LargeButtonProps {
  onPress: () => void; // 버튼 클릭 시 실행할 함수
}

const LargeButton: React.FC<LargeButtonProps> = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <FontText size={30} color="#F68E5F">
        보호자{'\n'}번호{'\n'}등록하기
      </FontText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    flex: 1,
    height: '50%',
    borderWidth: 5,
    borderColor: '#F68E5F',
    borderStyle: 'dotted',
    borderRadius: 5,
    padding: '5%',
    justifyContent: 'center',
  },
});

export default LargeButton;
