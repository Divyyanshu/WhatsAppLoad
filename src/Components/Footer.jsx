import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CommonFonts, CommonHeights } from '../Constants/dimension';

const Footer = ({ companyName = 'Load Infotech' }) => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Powered by <Text style={styles.boldText}>{companyName}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: CommonHeights.height24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: CommonFonts.font14,
  },
  boldText: {
    fontWeight: '700',
    color: '#6b7280',
    fontSize: CommonFonts.font14,
  },
});

export default Footer;
