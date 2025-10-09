import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const TopBar = ({ title = 'Own Chats', onLogoutPress, onRefreshPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{title}</Text>
        <View style={styles.iconsRow}>
          {onRefreshPress && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRefreshPress}
            >
              <Feather name="refresh-cw" size={24} color="#408AC7" />
            </TouchableOpacity>
          )}
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
    paddingHorizontal: 30,
    borderBottomWidth: 0.2,
    borderBottomColor: '#ccc',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.8,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
    marginLeft: 12,
  },
});

export default TopBar;
