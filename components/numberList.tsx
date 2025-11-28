import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import NumberBox from './numberBox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegistryModal from './registryModal';
import LargeButton from './largeButton';

const NumberList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nok, setNok] = useState<{id: number; name: string; number: string}[]>(
    [],
  );

  const loadNok = async () => {
    const storedData = await AsyncStorage.getItem('nok');
    const parsedData = storedData ? JSON.parse(storedData) : [];
    const dataWithIds = parsedData.map((item: any, index: number) => ({
      id: index + 1,
      ...item,
    }));
    setNok(dataWithIds);
  };

  useEffect(() => {
    loadNok();
  }, []);

  return (
    <View style={styles.container}>
      <RegistryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={loadNok}
      />
      ;
      {nok.length === 4 ? (
        nok.map((data, index) => (
          <NumberBox
            key={data.number}
            index={index}
            name={data.name}
            number={data.number}
            onDelete={loadNok} // 삭제 후 상태 갱신
          />
        ))
      ) : (
        <>
          {nok.map((data, index) => (
            <NumberBox
              key={data.number}
              index={index}
              name={data.name}
              number={data.number}
              onDelete={loadNok} // 삭제 후 상태 갱신
            />
          ))}
          <LargeButton onPress={() => setModalVisible(true)} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '95%',
    height: '80%',
    marginTop: '5%',
    marginBottom: '5%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default NumberList;
