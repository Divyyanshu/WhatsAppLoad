import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const TopBar = ({ title = 'Own Chats', onLogoutPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{title}</Text>
        <TouchableOpacity style={styles.logoutIcon} onPress={onLogoutPress}>
          <Feather name="log-out" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderBottomWidth: 0.2,
    borderBottomColor: '#ccc',
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  logoutIcon: {
    padding: 5,
  },
});

export default TopBar;
