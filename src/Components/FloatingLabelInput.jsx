import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Animated,
  StyleSheet,
  Easing,
  Appearance,
} from 'react-native';
import { COLORS } from '../Constants/Colors';
import { rawHeight, rawWidth } from '../Constants/dimension';

const FloatingLabelInput = ({ label, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(
    new Animated.Value(props.value ? 1 : 0),
  ).current;

  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || props.value !== '' ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isFocused, props.value]);

  // Label style
  const labelStyle = {
    position: 'absolute',
    left: 16,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -6],
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

  // Container style with subtle shadow on focus
  const containerStyle = [
    styles.container,
    {
      borderColor: isFocused ? theme.primary : theme.border,
      shadowOpacity: isFocused ? 0.12 : 0,
    },
  ];

  return (
    <View style={containerStyle}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        {...props}
        style={[styles.input, { color: theme.black }]}
        placeholder=""
        placeholderTextColor={theme.label}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    height: rawHeight(55),
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    paddingHorizontal: 16,
    fontSize: 14,
    height: '100%',
    zIndex: 99,
  },
});

export default FloatingLabelInput;
