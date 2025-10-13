import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  RefreshControl,
  Appearance,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../Context/UserContext';
import { API_URL } from '../config';
import TopBar from '../Components/TopBar';
import WhatsAppLoaders from '../Components/WhatsAppLoaders';
import { COLORS } from '../Constants/Colors';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Footer from '../Components/Footer';

// --- Utility Functions ---
const pad = n => (n < 10 ? '0' + n : n);

const colorScheme = Appearance.getColorScheme();
const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
function getDateLabel(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1,
  )}-${date.getFullYear()}`;
}

const groupChatsByMobileNo = chatsArray => {
  if (!Array.isArray(chatsArray)) return {};
  return chatsArray.reduce((groupedData, currentChat) => {
    const mobileNo = currentChat.ClientMobileno;
    if (!groupedData[mobileNo]) groupedData[mobileNo] = [];
    groupedData[mobileNo].push(currentChat);
    return groupedData;
  }, {});
};

// Memoized ChatItem
const ChatItem = React.memo(({ item, index, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={() => onPress(item)}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{index + 1}</Text>
    </View>
    <View style={styles.chatInfo}>
      <View style={styles.chatHeader}>
        <Text style={styles.number}>{item.number}</Text>
        <Text style={styles.lastDate}>{item.lastDateLabel}</Text>
      </View>
      <Text style={styles.lastMessage} numberOfLines={1}>
        {item.lastMessage}
      </Text>
    </View>
  </TouchableOpacity>
));

const OwnChat = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contactList, setContactList] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();

  // Refresh screen automatically when navigated back from TemplateCard
  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        console.log('Auto-refresh triggered from TemplateCard 🚀');
        handleRefresh();
        navigation.setParams({ refresh: false });
      }
    }, [route.params?.refresh]),
  );
  const { user, logout, authenticated } = useContext(UserContext);
  console.log('contactList', contactList);
  const loadChats = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cachedChats = await AsyncStorage.getItem('ownChats');
        if (cachedChats) {
          setContactList(JSON.parse(cachedChats));
          setIsLoading(false);
        }
      }

      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const { WhatsAppSenderID, LoginID } = JSON.parse(userStr);

      const url = `${API_URL}/GetOwnChatForLogID?senderNo=${WhatsAppSenderID}&LoginId=${LoginID}&date=`;
      const response = await fetch(url, { method: 'POST' });
      const result = await response.json();

      if (result && Array.isArray(result.Data)) {
        const newRawDataString = JSON.stringify(result.Data);
        const oldRawDataString = await AsyncStorage.getItem('rawOwnChats');

        if (newRawDataString !== oldRawDataString || forceRefresh) {
          const groupedChats = groupChatsByMobileNo(result.Data);
          setContactList(groupedChats);
          await AsyncStorage.setItem('ownChats', JSON.stringify(groupedChats));
          await AsyncStorage.setItem('rawOwnChats', newRawDataString);
        }
      }
    } catch (error) {
      console.error('Error fetching OwnChat API:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadChats(true);
    setIsRefreshing(false);
  }, [loadChats]);

  const sortedContactArray = useMemo(() => {
    const contactArray = Object.keys(contactList).map(number => {
      const chats = contactList[number];
      const latestChat = chats.reduce((latest, current) =>
        new Date(latest.ProcessDate) > new Date(current.ProcessDate)
          ? latest
          : current,
      );
      return {
        number,
        lastMessage: latestChat.MessageText?.slice(0, 40) || 'Attachment',
        lastDate: latestChat.ProcessDate
          ? new Date(latestChat.ProcessDate)
          : null,
        chats,
      };
    });
    return contactArray
      .map(chat => ({
        ...chat,
        lastDateLabel: getDateLabel(chat.lastDate),
      }))
      .sort((a, b) => (b.lastDate || 0) - (a.lastDate || 0));
  }, [contactList]);

  const filteredContacts = useMemo(() => {
    if (!search) return sortedContactArray;
    return sortedContactArray.filter(
      chat =>
        chat.number.includes(search) ||
        chat.lastMessage.toLowerCase().includes(search.toLowerCase()),
    );
  }, [sortedContactArray, search]);

  const handleLogout = async () => {
    setShowModal(false);
    await logout(navigation);
  };

  const navigateToChat = useCallback(
    item => {
      navigation.navigate('ChatScreen', {
        number: item.number,
        chats: item.chats,
      });
    },
    [navigation],
  );

  const renderChatItem = useCallback(
    ({ item, index }) => (
      <ChatItem item={item} index={index} onPress={navigateToChat} />
    ),
    [navigateToChat],
  );

  return (
    <View style={styles.container}>
      <TopBar
        title="Own Chats"
        onLogoutPress={() => setShowModal(true)}
        onRefreshPress={async () => {
          setIsLoading(true);
          await handleRefresh();
          setIsLoading(false);
        }}
      />

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Feather
            name="search"
            size={20}
            color="#888"
            style={styles.searchIconWrap}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={'#888'}
            value={search}
            onChangeText={setSearch}
            inputMode="search"
          />
          {search?.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather
                name="x-circle"
                size={20}
                color="#888"
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Loader Integration */}
      {isLoading ? (
        <View style={styles.loaderWrapper}>
          <WhatsAppLoaders type="dots" color={COLORS.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.number}
          renderItem={renderChatItem}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#b3a0e0']}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Text style={{ color: '#666' }}>No chats found</Text>
            </View>
          }
        />
      )}

      {/* Logout Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Feather
              name="alert-circle"
              size={48}
              color="#d01623ff"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.modalTitle}>Logout?</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to logout from your account?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#f2f2f2' }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#d01623ff' }]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Footer companyName="Load Infotech" />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: { paddingHorizontal: 16, marginBottom: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    height: 50,
    paddingHorizontal: 8,
  },
  searchIconWrap: { paddingHorizontal: 8 },
  clearIcon: {
    paddingHorizontal: 8,
    opacity: 0.8,
  },
  searchInput: { flex: 1, fontSize: 16, color: theme.black },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  chatInfo: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  number: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 2 },
  lastDate: { fontSize: 12, color: '#888' },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 280,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    color: '#666',
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelText: { color: '#555', fontSize: 16, fontWeight: 'bold' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default OwnChat;
