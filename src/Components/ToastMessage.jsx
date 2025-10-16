import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ToastMessage = ({
  message,
  visible,
  onHide,
  duration = 2000,
  type = 'info',
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#22c55e', icon: 'check-circle' };
      case 'error':
        return { backgroundColor: '#ef4444', icon: 'x-circle' };
      case 'warning':
        return { backgroundColor: '#facc15', icon: 'alert-triangle' };
      default:
        return { backgroundColor: '#3b82f6', icon: 'info' };
    }
  };

  const { backgroundColor, icon } = getToastStyle();

  useEffect(() => {
    if (visible) {
      // Slide down + fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 60,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start(() => onHide && onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, slideAnim, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { backgroundColor, opacity, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Feather name={icon} size={20} color="#fff" style={styles.icon} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
  },
  icon: {
    marginRight: 8,
  },
});

export default ToastMessage;
