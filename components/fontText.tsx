import {StyleSheet, Text, View, TextStyle} from 'react-native';
import {FontTextProps} from '../constans/interface';

interface ExtendedFontTextProps extends FontTextProps {
  style?: TextStyle;
}

const FontText: React.FC<ExtendedFontTextProps> = ({
  size,
  color,
  children,
  style,
}) => {
  return (
    <View>
      <Text style={[styles.text, {fontSize: size, color: color}, style]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Jalnan2',
    textAlign: 'center',
  },
});

export default FontText;
