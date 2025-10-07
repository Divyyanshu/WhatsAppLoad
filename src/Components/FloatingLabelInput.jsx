// FloatingLabelInput.js
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, Easing, Appearance } from 'react-native';
import { COLORS } from '../Constants/Colors';


const FloatingLabelInput = ({ label, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(props.value === '' ? 0 : 1)).current;
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
  // console.log(colorScheme);

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || props.value !== '' ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false, // color and fontSize are not supported with native driver
    }).start();
  }, [isFocused, props.value]);

  // Styles for the label when focused and unfocused
  const labelStyle = {
    position: 'absolute',
    left: 16,
    bottom: 6,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.label, theme.primary],
    }),
    backgroundColor: theme.background,
    paddingHorizontal: 4,
    zIndex: 1,
  };

  const containerStyle = [
    styles.container,
    { borderColor: isFocused ? theme.primary : theme.border },
  ];

  return (
    <View style={containerStyle}>
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>
      <TextInput
        {...props}
        style={styles.input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    // paddingTop: 4,
    width: '100%',
    height: 55,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 20,
    // backgroundColor: 'red',
    fontSize: 14,
    color: '#111827',
    textAlign: 'start',
    zIndex: 99,
   
  },
});

export default FloatingLabelInput;