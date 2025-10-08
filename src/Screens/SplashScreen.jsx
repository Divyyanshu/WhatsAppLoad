import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import {
  CommonFonts,
  CommonHeights,
  CommonWidths,
} from '../Constants/dimension';
import { COLORS } from '../Constants/Colors';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../Assets/images/logoLogin.png')}
        style={[styles.logo, { opacity: fadeAnim }]}
        resizeMode="contain"
      />

      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
        WhatsApp By
      </Animated.Text>

      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Load Infotech
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
  },
  logo: {
    width: CommonWidths.width100,
    height: CommonHeights.height120,
  },
  subtitle: {
    fontSize: CommonFonts.font24,
    color: COLORS.light.primary,
  },
  title: {
    fontSize: CommonFonts.font32,
    fontWeight: 'bold',
    color: COLORS.light.primary,
    marginBottom: CommonHeights.height10,
  },
});

export default SplashScreen;
// import React, { useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Animated } from 'react-native';
// import {
//   CommonFonts,
//   CommonHeights,
//   CommonWidths,
// } from '../Constants/dimension';
// import { COLORS } from '../Constants/Colors';

// const SplashScreen = () => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1100,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Animated.Image
//         source={require('../Assets/images/logoLogin.png')}
//         style={[styles.logo, { opacity: fadeAnim }]}
//         resizeMode="contain"
//       />

//       <Text style={styles.subtitle}>WhatsApp By</Text>
//       <Text style={styles.title}>Load Infotech</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.light.background,
//   },
//   logo: {
//     width: CommonWidths.width100,
//     height: CommonHeights.height120,
//     marginBottom: CommonHeights.height10,
//   },
//   subtitle: {
//     fontSize: CommonFonts.font24,
//     color: COLORS.light.primary,
//   },
//   title: {
//     fontSize: CommonFonts.font32,
//     fontWeight: 'bold',
//     color: COLORS.light.primary,
//     marginTop: CommonHeights.height5,
//   },
// });

// export default SplashScreen;
