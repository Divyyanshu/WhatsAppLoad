import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../Constants/Colors';
import { rawWidth, rawHeight } from '../Constants/dimension';

const WhatsAppLoaders = ({
  type = 'circular',
  color = COLORS.light.primary,
  size = rawWidth(80),
}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'dots') {
      const animateDot = dot => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -10,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      };
      animateDot(dot1);
      setTimeout(() => animateDot(dot2), 150);
      setTimeout(() => animateDot(dot3), 300);
    } else if (type === 'bar') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progress, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(progress, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    }
  }, [type]);

  const renderLoader = () => {
    if (type === 'dots') {
      const dotStyle = dot => ({
        transform: [{ translateY: dot }],
        width: rawWidth(12),
        height: rawWidth(12),
        borderRadius: rawWidth(6),
        backgroundColor: color,
        marginHorizontal: rawWidth(6),
      });

      return (
        <View style={styles.loaderContainer}>
          <View style={styles.dotsContainer}>
            <Animated.View style={dotStyle(dot1)} />
            <Animated.View style={dotStyle(dot2)} />
            <Animated.View style={dotStyle(dot3)} />
          </View>
          <Text style={styles.loaderText}>Please wait...</Text>
        </View>
      );
    } else if (type === 'bar') {
      const widthInterpolate = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '80%'],
      });

      return (
        <View style={styles.loaderContainer}>
          <View style={styles.barOuter}>
            <View style={styles.barBackground}>
              <Animated.View
                style={[
                  styles.barForeground,
                  { width: widthInterpolate, backgroundColor: color },
                ]}
              />
            </View>
          </View>
          <Text style={styles.loaderText}>Loading, please wait...</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.loaderContainer}>
          <View style={styles.circularContainer}>
            <ActivityIndicator
              size="large"
              color={color}
              style={{ width: size, height: size }}
            />
          </View>
          <Text style={styles.loaderText}>Please wait...</Text>
        </View>
      );
    }
  };

  return renderLoader();
};

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularContainer: {
    width: rawWidth(100),
    height: rawWidth(100),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: rawWidth(20),
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  barOuter: {
    padding: rawWidth(20),
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    width: rawWidth(200),
  },
  barBackground: {
    height: rawHeight(8),
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barForeground: {
    height: rawHeight(8),
    borderRadius: 4,
  },
  loaderText: {
    marginTop: rawHeight(6),
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default WhatsAppLoaders;
