import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FloatingLabelInput from '../Components/FloatingLabelInput.jsx';
import ToastMessage from '../Components/ToastMessage.jsx';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../Constants/Colors.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../Context/UserContext.js';
import { API_URL } from '../config.js';
import {
  CommonFonts,
  CommonHeights,
  CommonWidths,
  rawWidth,
  rawHeight,
} from '../Constants/dimension';
import Footer from '../Components/Footer.jsx';

const LoginScreen = () => {
  const [username, setUsername] = useState('trial');
  const [password, setPassword] = useState('trial@1234');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);

  const navigation = useNavigation();
  const { setUser } = useContext(UserContext);

  const showToast = (msg, type = 'info') =>
    setToast({ visible: true, message: msg, type });
  const hideToast = () => setToast({ visible: false, message: '', type: '' });

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

  const handleLogin = async () => {
    if (!username) return showToast('Please enter username', 'warning');
    if (!password) return showToast('Please enter password', 'warning');

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/login?Username=${encodeURIComponent(
          username,
        )}&Password=${encodeURIComponent(password)}`,
        { method: 'POST' },
      );
      const result = await response.json();

      if (result.Message === 'Success' && result.Data?.length > 0) {
        const userData = result.Data[0];
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        showToast('Login successful', 'success');
        setTimeout(() => {
          navigation.replace('OwnChat', { username, userData });
        }, 800);
      } else {
        // Handle different error messages
        if (result.Data === 'Invalid Password') {
          showToast('Incorrect password. Please try again.', 'error');
        } else if (result.Data === 'Invalid Username') {
          showToast('Username not found. Please check again.', 'error');
        } else {
          showToast(result.Data || 'Invalid credentials.', 'error');
        }
      }
    } catch (error) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
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
            <View style={styles.illustrationContainer}>
              <Image
                source={require('../Assets/images/logoLogin.png')}
                style={styles.illustration}
                resizeMode="contain"
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

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotContainer}
                onPress={() => setForgotModalVisible(true)}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.8 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <ToastMessage
                message={toast.message}
                visible={toast.visible}
                onHide={hideToast}
                duration={900}
                type={toast.type}
              />
            </View>

            {!keyboardVisible && <Footer companyName="Load Infotech" />}
          </View>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={forgotModalVisible}
          onRequestClose={() => setForgotModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Forgot Password!</Text>
              <Text style={styles.modalText}>
                To recover your password, call us at{' '}
                <Text
                  style={styles.phoneNumber}
                  onPress={() => Linking.openURL('tel:+917665623850')}
                >
                  +91-7665623850
                </Text>
              </Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setForgotModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  card: {
    backgroundColor: 'white',
    padding: CommonWidths.width20,
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: CommonHeights.height24,
    height: rawHeight(180),
  },
  illustration: {
    width: rawWidth(160),
    height: rawHeight(160),
  },
  form: {
    width: '100%',
  },
  passwordContainer: {
    marginTop: CommonHeights.height16,
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  forgotContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  forgotText: {
    color: COLORS.light.primary,
    fontWeight: '500',
    fontSize: CommonFonts.font14,
  },
  button: {
    marginTop: CommonHeights.height24,
    width: '100%',
    backgroundColor: COLORS.light.primary,
    paddingVertical: CommonHeights.height14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: CommonFonts.font16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '80%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: CommonFonts.font18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalText: {
    fontSize: CommonFonts.font16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  phoneNumber: {
    fontWeight: '700',
    color: COLORS.light.black,
    textDecorationLine: 'underline',
  },
  modalButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: CommonFonts.font16,
    fontWeight: '600',
  },
});

export default LoginScreen;
