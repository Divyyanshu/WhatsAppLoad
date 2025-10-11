import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../Constants/Colors';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ title = 'Own Chats', onLogoutPress, onRefreshPress }) => {
  const navigation = useNavigation();

  // const myScreeenNavigate = () => {
  //   navigation.navigate('MyScreen');
  // };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{title}</Text>
        <View style={styles.iconsRow}>
          {/* <TouchableOpacity
            style={styles.iconButton}
            onPress={myScreeenNavigate}
          >
            <Feather name="divide-square" size={24} color={COLORS.dark.black} />
          </TouchableOpacity> */}
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
    paddingHorizontal: 10,
    borderBottomWidth: 0.2,
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
  iconButton: {
    padding: 5,
    marginLeft: 12,
  },
});

export default TopBar;
