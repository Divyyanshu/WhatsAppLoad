/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useContext, useEffect, useState } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, ActivityIndicator } from 'react-native';
import LoginScreen from './src/Screens/Login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import OwnChat from './src/Screens/OwnChat';
import ChatScreen from './src/Screens/ChatScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TemplateListScreen from './src/Screens/TemplateListScreen';
import { UserContext, UserProvider } from './src/Context/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

 
function LoadingScreen() {
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}> WhatsApp By</Text>
            <Text style={{ fontSize: 32, marginBottom: 16, fontWeight: 'bold' }}>Load Infotech</Text>

      {/* <ActivityIndicator size="large" /> */}
    </View>
  );
}

const Stack = createStackNavigator();

function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
   const { authenticated } = useContext(UserContext);
   const { user } = useContext(UserContext);
  useEffect(() => {
    const checkUser = async () => {
      // Simulate loading
      // await new Promise(res => setTimeout(res, 1000));
      const user = await AsyncStorage.getItem('user');
      setInitialRoute(user ? 'OwnChat' : 'Login');

    }
    checkUser();
  }, []);

  if (!initialRoute) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OwnChat" component={OwnChat} options={{ headerShown: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Templates" component={TemplateListScreen} options={{ title: "Send template messages"}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    // <SafeAreaView>
    <SafeAreaView style={{ flex: 1 }}>
    <UserProvider>
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {/* <NewAppScreen templateFileName="App.tsx" /> */}

      <RootNavigator />
    </View>
    </UserProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
