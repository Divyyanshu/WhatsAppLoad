import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const ToastMessage = ({ message, visible, onHide, duration = 2000 }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide && onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 50,
    left: 30,
    right: 30,
    backgroundColor: '#222',
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ToastMessage;