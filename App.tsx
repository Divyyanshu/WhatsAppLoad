/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import LoginScreen from './src/Screens/Login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import OwnChat from './src/Screens/OwnChat';
import ChatScreen from './src/Screens/ChatScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

 

const Stack = createStackNavigator();
function RootNavigator() {
  //  const { isLoggedIn, loading } = useContext(AuthContext);

  // if (loading) {
  //   return <LoadingScreen />;
  // }



  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }} initialRouteName="OwnChat">
        
          <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}} />
          <Stack.Screen name="OwnChat" component={OwnChat} options={{headerShown:false}} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{headerShown:false}}/>
        </Stack.Navigator>
    </NavigationContainer>
  );
}



function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {/* <NewAppScreen templateFileName="App.tsx" /> */}

      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
