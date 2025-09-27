import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// You can replace this with your actual image asset
const loginIllustration = { uri: 'https://placehold.co/300x200/E0E0E0/333333?text=Illustration' };

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.content}>
          {/* Top Illustration */}
          <View style={styles.imageContainer}>
            <Image
              source={loginIllustration}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#a9a9a9"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#a9a9a9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Text style={styles.eyeText}>{isPasswordVisible ? '👁️' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.signInButton}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by <Text style={styles.footerBrandText}>Load Infotech</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  illustration: {
    width: 300,
    height: 200,
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 15,
  },
  eyeText: {
    fontSize: 20,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#b3a0e0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  signInButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionButton: {
    backgroundColor: '#333333',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#a9a9a9',
    fontSize: 14,
  },
  footerBrandText: {
    color: '#888888',
    fontWeight: 'bold',
  },
});

export default LoginScreen;





import React, { useState } from 'react';
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';

// // You can replace this with your actual image asset
// const loginIllustration = { uri: 'https://placehold.co/300x200/E0E0E0/333333?text=Illustration' };

// const LoginScreen = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [isUsernameFocused, setIsUsernameFocused] = useState(false);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
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
//               <View style={styles.animatedLabelContainer}>
//                 <Text
//                   style={[styles.animatedLabel, isUsernameFocused || username ? styles.animatedLabelFocused : null]}
//                 >
//                   Username
//                 </Text>
//               </View>
//               <TextInput
//                 style={styles.input}
//                 value={username}
//                 onChangeText={setUsername}
//                 autoCapitalize="none"
//                 onFocus={() => setIsUsernameFocused(true)}
//                 onBlur={() => setIsUsernameFocused(false)}
//               />
//             </View>

//             <View style={[styles.inputContainer, { backgroundColor: '#FFF9DB' }]}> {/* yellow bg for password */}
//               <View style={styles.animatedLabelContainer}>
//                 <Text style={[styles.animatedLabel, styles.animatedLabelPassword]}>Password</Text>
//               </View>
//               <TextInput
//                 style={styles.input}
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry={!isPasswordVisible}
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
//     backgroundColor: '#F5F5FF',
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
//   animatedLabelContainer: {
//     position: 'absolute',
//     left: 20,
//     top: 18,
//     zIndex: 2,
//   },
//   animatedLabel: {
//     color: '#b3a0e0',
//     fontSize: 16,
//     opacity: 1,
//     top: 0,
//     left: 0,
//     position: 'relative',
//     transition: 'all 0.2s',
//   },
//   animatedLabelFocused: {
//     fontSize: 13,
//     top: -18,
//     color: '#b3a0e0',
//     opacity: 1,
//   },
//   animatedLabelPassword: {
//     color: '#F5E6A2',
//     fontWeight: 'bold',
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     fontSize: 16,
//     color: '#333',
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

