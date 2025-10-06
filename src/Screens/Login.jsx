// LoginScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Appearance
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import Feather from 'react-native-vector-icons/Feather'; // Using Feather icons
import FloatingLabelInput from '../Components/FloatingLabelInput.jsx';
import ToastMessage from '../Components/ToastMessage.jsx';

import { useNavigation } from '@react-navigation/native';
import { LoginPhoto } from '../Assets/index.js';
import { COLORS } from '../Constants/Colors.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../Context/UserContext.js';
import { API_URL } from '../config.js';

const colorScheme = Appearance.getColorScheme();
const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

const LoginScreen = () => {
  const [username, setUsername] = useState('trial');
  const [password, setPassword] = useState('trial@1234');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (msg) => setToast({ visible: true, message: msg });
  const hideToast = () => setToast({ visible: false, message: '' });

  const navigation = useNavigation();

  const { setUser, setAuthenticated } = useContext(UserContext);

  const checkAsyncStorage = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage Keys:', allKeys);

      // for (const key of allKeys) {
      //   const value = await AsyncStorage.getItem(key);
      //   console.log(`Key: ${key}, Value: ${value}`);
      // }
    } catch (error) {
      console.error('Error retrieving AsyncStorage data:', error);
    }
  };

  // Call this function in your component's lifecycle or a button press
  // For example, in a useEffect hook:
  useEffect(() => {
    checkAsyncStorage();
  }, []);


  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


  //  function to handle login
  const handleLogin = async () => {

    if (!username) {
      showToast('Please enter username');
      return;
    } else {
      if (!password) {
        showToast('Please enter password');
        return;
      }
    }

    try {
      const response = await fetch(
        `${API_URL}/login?Username=${encodeURIComponent(username)}&Password=${encodeURIComponent(password)}`,
        { method: 'POST' }
      );
      console.log('Login response status:', response, response.status);
      
      const result = await response.json();
      if (result.Message === 'Success' && result.Data && result.Data.length > 0) {
        // Store user data in AsyncStorage
        const userData = result.Data[0];

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        // console.log('Login successful:', result.Data[0])
        const userFromLocal = await AsyncStorage.getItem('user');
        console.log('User from local storage:', JSON.parse(userFromLocal));
        setUser(userData); //context update
        // setAuthenticated(true);
        navigation.replace('OwnChat', { username, userData });
      } else {
        showToast(result.Data || 'Invalid credentials');
      }
    } catch (error) {
      showToast('Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* ...existing code... */}
            <View style={styles.illustrationContainer}>
              <Image source={LoginPhoto} style={{ width: '70%', height: '100%' }} />
            </View>
            <View style={styles.form}>
              <FloatingLabelInput
                label="Username"
                value={username}
                onChangeText={setUsername}
              />
              <View style={styles.passwordContainer}>
                <FloatingLabelInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Feather
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
              <ToastMessage
                message={toast.message}
                visible={toast.visible}
                onHide={hideToast}
                duration={600}
              />
            </View>
            {!keyboardVisible && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Powered by <Text style={styles.boldText}>Load Infotech</Text>
                </Text>
              </View>
            )}
          </View>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb', // bg-gray-50
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  card: {
    backgroundColor: 'white',
    padding: 32, // p-8
    width: '100%',
    maxWidth: 400,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32, // mb-8
    height: 200, // Adjusted for mobile
  },
  form: {
    width: '100%',
    // height: '60%', // Adjusted for 

  },
  passwordContainer: {
    marginTop: 32, // space-y-8
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  button: {
    marginTop: 32, // space-y-8
    width: '100%',
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600', // font-semibold
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    // backgroundColor: 'transparent',
  },
  footerText: {
    color: '#9ca3af', // text-gray-400
    textAlign: 'center',
    fontSize: 16

  },
  boldText: {
    fontWeight: '800',
    color: '#6b7280', // text-gray-500
    fontSize: 20
  },
});

export default LoginScreen;


// import React, { useRef, useState } from 'react';
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Animated,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';

// const loginIllustration = { uri: 'https://placehold.co/300x200/E0E0E0/333333?text=Illustration' };

// const AnimatedText = Animated.createAnimatedComponent(Text);

// const LoginScreen = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);

//   // Animation values
//   const usernameLabelAnim = useRef(new Animated.Value(0)).current;
//   const passwordLabelAnim = useRef(new Animated.Value(0)).current;

//   const handleFocus = (anim) => {
//     Animated.timing(anim, {
//       toValue: 1,
//       duration: 200,
//       useNativeDriver: false,
//     }).start();
//   };

//   const handleBlur = (anim, value) => {
//     if (!value) {
//       Animated.timing(anim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: false,
//       }).start();
//     }
//   };

//   // Interpolate label position and size
//   const getLabelStyle = (anim) => ({
//     position: 'absolute',
//     left: 20,
//     top: anim.interpolate({
//       inputRange: [0, 1],
//       outputRange: [18, -2],
//     }),
//     fontSize: anim.interpolate({
//       inputRange: [0, 1],
//       outputRange: [16, 13],
//     }),
//     color: '#b3a0e0',
//     backgroundColor: 'transparent',
//     zIndex: 2,
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardAvoidingContainer}
//       >
//         <View style={styles.content}>
//           {/* Top Illustration */}
//           <View style={styles.imageContainer}>
//             <Image
//               source={loginIllustration}
//               style={styles.illustration}
//               resizeMode="contain"
//             />
//           </View>

//           {/* Input Fields */}
//           <View style={styles.inputSection}>
//             <View style={styles.inputContainer}>
//               <AnimatedText style={getLabelStyle(usernameLabelAnim)}>
//                 Username
//               </AnimatedText>
//               <TextInput
//                 style={styles.input}
//                 value={username}
//                 onChangeText={setUsername}
//                 autoCapitalize="none"
//                 onFocus={() => handleFocus(usernameLabelAnim)}
//                 onBlur={() => handleBlur(usernameLabelAnim, username)}
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <AnimatedText style={getLabelStyle(passwordLabelAnim)}>
//                 Password
//               </AnimatedText>
//               <TextInput
//                 style={styles.input}
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry={!isPasswordVisible}
//                 onFocus={() => handleFocus(passwordLabelAnim)}
//                 onBlur={() => handleBlur(passwordLabelAnim, password)}
//               />
//               <TouchableOpacity
//                 style={styles.eyeIcon}
//                 onPress={() => setIsPasswordVisible(!isPasswordVisible)}
//               >
//                 <Text style={styles.eyeText}>👁️</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Buttons */}
//           <View style={styles.buttonSection}>
//             <TouchableOpacity style={styles.signInButton}>
//               <Text style={styles.signInButtonText}>Sign In</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <Text style={styles.footerText}>
//           Powered by <Text style={styles.footerBrandText}>Load Infotech</Text>
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   keyboardAvoidingContainer: {
//     flex: 1,
//     width: '100%',
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   imageContainer: {
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   illustration: {
//     width: 250,
//     height: 180,
//     marginTop: 10,
//   },
//   inputSection: {
//     width: '100%',
//     marginBottom: 20,
//     marginTop: 30,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 15,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     position: 'relative',
//     minHeight: 56,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     fontSize: 16,
//     color: '#b3a0e0',
//     backgroundColor: 'transparent',
//   },
//   eyeIcon: {
//     padding: 15,
//   },
//   eyeText: {
//     fontSize: 20,
//     color: '#b3a0e0',
//   },
//   buttonSection: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   signInButton: {
//     backgroundColor: '#b3a0e0',
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 10,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   signInButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
//   footerText: {
//     color: '#a9a9a9',
//     fontSize: 16,
//   },
//   footerBrandText: {
//     color: '#b3a0e0',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
// });

// export default LoginScreen;
