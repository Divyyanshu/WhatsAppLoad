import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
        setAuthenticated(true);
      }
      setLoading(false);
    };
    loadUser();
  }, []);


  const login = (userData) => {
    setUser(userData);
    setAuthenticated(true);
  };

  // Logout function
  const logout = async (navigation) => {
    // await AsyncStorage.multiRemove(['user', 'ownChats', 'rawOwnChats']);
        await AsyncStorage.clear();

    setUser(null);
    setAuthenticated(false);
    if (navigation) navigation.replace('Login');
  };

  return (
    <UserContext.Provider value={{ user, setUser: login, authenticated, setAuthenticated, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};