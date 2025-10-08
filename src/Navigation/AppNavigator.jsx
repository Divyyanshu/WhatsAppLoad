import React, { useEffect, useState, useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../Screens/Login';
import OwnChat from '../Screens/OwnChat';
import ChatScreen from '../Screens/ChatScreen';
import TemplateListScreen from '../Screens/TemplateListScreen';
import SplashScreen from '../Screens/SplashScreen';
import { UserContext } from '../Context/UserContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const { authenticated } = useContext(UserContext);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem('user');
      setTimeout(() => {
        setInitialRoute(user ? 'OwnChat' : 'Login');
      }, 1500);
    };

    checkUser();
  }, []);

  if (!initialRoute) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OwnChat" component={OwnChat} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen
          name="Templates"
          component={TemplateListScreen}
          options={{ title: 'Send template messages' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
