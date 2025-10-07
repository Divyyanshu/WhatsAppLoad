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
  Appearance,
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

  const showToast = msg => setToast({ visible: true, message: msg });
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
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
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
        `${API_URL}/login?Username=${encodeURIComponent(
          username,
        )}&Password=${encodeURIComponent(password)}`,
        { method: 'POST' },
      );
      console.log('Login response status:', response, response.status);

      const result = await response.json();
      if (
        result.Message === 'Success' &&
        result.Data &&
        result.Data.length > 0
      ) {
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
              <Image
                source={LoginPhoto}
                style={{ width: '70%', height: '100%' }}
              />
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
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
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
    fontSize: 16,
  },
  boldText: {
    fontWeight: '800',
    color: '#6b7280', // text-gray-500
    fontSize: 20,
  },
});

export default LoginScreen;
