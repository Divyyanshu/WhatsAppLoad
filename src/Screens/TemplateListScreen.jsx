import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  View,
  Appearance,
  TextInput,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import TemplateCard from '../Components/TemplateCard';
import { UserContext } from '../Context/UserContext';
import { COLORS } from '../Constants/Colors';
import { API_URL } from '../config';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import WhatsAppLoaders from '../Components/WhatsAppLoaders';

const colorScheme = Appearance.getColorScheme();
const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
let templateCache = null;

const TemplateListScreen = ({ route }) => {
  const navigation = useNavigation();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const number = route.params?.number;
  const { user } = useContext(UserContext);

  // Encapsulated function to fetch templates
  const fetchTemplates = async (isRefresh = false) => {
    if (templateCache && !isRefresh) {
      console.log('Loading templates from cache.');
      setTemplates(templateCache);
      setFilteredTemplates(templateCache);
      setLoading(false);
      return;
    }

    console.log('Fetching templates from API...');
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const Related_DealerCode = user.Related_DealerCode;
      const response = await fetch(
        `${API_URL}/getwhatsapptemplate?username=${Related_DealerCode}`,
        { method: 'POST' },
      );
      const jsonResponse = await response.json();

      if (jsonResponse && jsonResponse.Data) {
        templateCache = jsonResponse.Data;
        setTemplates(jsonResponse.Data);
        setFilteredTemplates(jsonResponse.Data);
      } else {
        throw new Error('Invalid data format from server.');
      }
    } catch (err) {
      setError('Failed to load templates: ' + err.message);
      console.error('Template fetch error:', err);
      templateCache = null;
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (user?.Related_DealerCode) {
      fetchTemplates();
    } else {
      setError('User data is not available.');
      setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredData = templates.filter(item => {
        // Check all relevant string fields for a match
        return (
          (item.Id && item.Id.toLowerCase().includes(lowerCaseQuery)) ||
          (item.Template &&
            item.Template.toLowerCase().includes(lowerCaseQuery)) ||
          (item.EntityId &&
            item.EntityId.toLowerCase().includes(lowerCaseQuery)) ||
          (item.TemplateID &&
            item.TemplateID.toLowerCase().includes(lowerCaseQuery)) ||
          (item.SenderID &&
            item.SenderID.toLowerCase().includes(lowerCaseQuery)) ||
          (item.TemplateName &&
            item.TemplateName.toLowerCase().includes(lowerCaseQuery)) ||
          (item.TemplateType &&
            item.TemplateType.toLowerCase().includes(lowerCaseQuery)) ||
          (item.ImagePath &&
            item.ImagePath.toLowerCase().includes(lowerCaseQuery)) ||
          (item.FileName &&
            item.FileName.toLowerCase().includes(lowerCaseQuery)) ||
          (item.Category &&
            item.Category.toLowerCase().includes(lowerCaseQuery)) ||
          (item.ServiceType &&
            item.ServiceType.toLowerCase().includes(lowerCaseQuery))
        );
      });
      setFilteredTemplates(filteredData);
    } else {
      setFilteredTemplates(templates); // If search is cleared, show all templates
    }
  }, [searchQuery, templates]);

  // Callback for the pull-to-refresh action
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTemplates(true); // `true` forces a fetch from the API
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <WhatsAppLoaders type="bar" color={COLORS.loader} />
      </View>
    );
  }

  if (error && templates.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Approved Template List</Text>
      </View>

      {/* Search Input Field */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search all template fields..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* FlatList */}
      {filteredTemplates.length > 0 ? (
        <FlatList
          data={filteredTemplates}
          keyExtractor={item => item.Id.toString()}
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              recipientNumber={number}
              user={user}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
            />
          }
        />
      ) : (
        <View style={styles.centered}>
          <Text>No templates found matching your search.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: theme.primary,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },

  backButton: {
    position: 'absolute',
    left: 10,
    padding: 5,
    zIndex: 1,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  listContent: {
    paddingVertical: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TemplateListScreen;
