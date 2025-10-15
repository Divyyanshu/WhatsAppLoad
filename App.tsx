import React from 'react';
import { StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProvider } from './src/Context/UserContext';
import AppNavigator from './src/Navigation/AppNavigator';
import { WebSocketProvider } from './src/Context/WebsocketContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UserProvider>
        <WebSocketProvider>
        <View style={styles.container}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppNavigator />
        </View>
        </WebSocketProvider>
      </UserProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default App;
