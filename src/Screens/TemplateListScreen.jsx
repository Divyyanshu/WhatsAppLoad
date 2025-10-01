// src/screens/TemplateListScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, FlatList, ActivityIndicator, Text, StyleSheet, View } from 'react-native';
import TemplateCard from '../Components/TemplateCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../Context/UserContext';

const API_URL = 'https://www.loadcrm.com/whatsappmobileapis/api';

const TemplateListScreen = ({ route }) => {

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const number = route.params?.number;
  // console.log("Recipient number from params:", number);
  
  const { user, authenticated } = useContext(UserContext);
  // console.log("User from context:", user);
  // console.log("Authenticated from context:", authenticated);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
       
        const Related_DealerCode = user.Related_DealerCode;
        const response = await fetch(`${API_URL}/getwhatsapptemplate?username=${Related_DealerCode}`, { method: 'POST' });
        const jsonResponse = await response.json();
        // console.log("Fetched templates:");
        setTemplates(jsonResponse.Data);
      } catch (err) {
        setError("Failed to load templates: " + err.message);
        console.error("Template fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Templates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.Id}
        renderItem={({ item }) => <TemplateCard template={item}  recipientNumber={number} user={user} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default TemplateListScreen;