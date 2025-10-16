import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const TopBar = ({ title = 'Own Chats', onLogoutPress, isConnected }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* Title Section */}
        <Text style={styles.header}>{title}</Text>

        {/* Icons Section */}
        <View style={styles.iconsRow}>
          {/* Connection Status Dot */}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#4CAF50' : '#F44336' },
            ]}
          />

          {/* Logout Icon */}
          {onLogoutPress && (
            <TouchableOpacity style={styles.iconButton} onPress={onLogoutPress}>
              <Feather name="log-out" size={24} color="#D32F2F" />
            </TouchableOpacity>
          )}
        </View>
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
    paddingHorizontal: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ccc',
  },
  header: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 50,
    marginRight: 14,
    borderWidth: 3,
    borderColor: '#C4C4C4',
  },
  iconButton: {
    padding: 5,
  },
});

export default TopBar;
