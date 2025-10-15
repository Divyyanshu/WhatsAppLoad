import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
  useRef,
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

// Utility to close WebSocket with a promise
const closeWebSocket = (wsRef, reconnectTimeoutRef) => {
  return new Promise(resolve => {
    if (wsRef.current) {
      wsRef.current.onclose = () => {
        console.log('Global WebSocket closed successfully');
        wsRef.current = null;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        resolve();
      };
      wsRef.current.onerror = () => {
        console.error('Global WebSocket error during closure');
        wsRef.current = null;
        resolve();
      };
      wsRef.current.close();
    } else {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      resolve();
    }
  });
};

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

const ChatItem = React.memo(({ item, index, onPress }) => {
  const unread = item.unread || 0;
  const isUnread = unread > 0;

  return (
    <TouchableOpacity
      style={[styles.item, isUnread && styles.unreadItem]}
      onPress={() => onPress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{index + 1}</Text>
        {isUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unread > 99 ? '99+' : unread}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <View style={styles.contactNameContainer}>
            {item.profileName && (
              <Text
                style={[styles.profileName, isUnread && styles.unreadTextBold]}
              >
                {item.profileName}
              </Text>
            )}
            <Text style={[styles.number, isUnread && styles.unreadTextBold]}>
              {item.number}
            </Text>
          </View>
          <Text style={[styles.lastDate, isUnread && styles.unreadTextBold]}>
            {item.lastDateLabel}
          </Text>
        </View>

        <Text
          style={[styles.lastMessage, isUnread && styles.unreadTextBold]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const OwnChat = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contactList, setContactList] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();

  const { user, logout, authenticated } = useContext(UserContext);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  console.log('Current user from context:', user);

  const setupWebSocket = useCallback(() => {
    // Guard: Skip if user or WhatsAppSenderID is not ready
    if (!user || !user.WhatsAppSenderID) {
      console.log(
        'User or WhatsAppSenderID not ready, skipping WebSocket setup',
        { user },
      );
      return;
    }

    console.log('Setting up WebSocket with sender:', user.WhatsAppSenderID);

    // Close existing WebSocket if it exists
    closeWebSocket(ws, reconnectTimeoutRef).then(() => {
      const wsUrl = `wss://www.loadcrm.com/whatsappwebsocket/ws/global?senderNumber=${user.WhatsAppSenderID}&sysIpAddress=192.168.1.100&user=app`;
      console.log('Connecting to WS URL:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Global WebSocket Connected successfully');
      };

      ws.current.onmessage = e => {
        try {
          const msg = JSON.parse(e.data);
          console.log('Received WS message:', msg);

          // Skip connection messages
          if (
            msg.type === 'connectionReplaced' ||
            msg.type === 'connectionEstablished'
          ) {
            console.log('Skipping connection message');
            return;
          }

          // Handle new received message
          if (msg.Mode === 'Received' && msg.ClientMobileno) {
            console.log(
              'Processing new received message for mobile:',
              msg.ClientMobileno,
            );
            setContactList(prevContactList => {
              const mobileNo = msg.ClientMobileno;
              const updatedChats = { ...prevContactList };

              if (!updatedChats[mobileNo]) {
                updatedChats[mobileNo] = [];
              }

              // Check if message already exists (by id or Uid)
              const messageId = msg.id || msg.Uid;
              const exists = updatedChats[mobileNo].some(
                chat => (chat.id || chat.Uid) === messageId,
              );
              if (!exists) {
                updatedChats[mobileNo].push(msg);
                console.log('Added new message to contact list for:', mobileNo);
              } else {
                console.log(
                  'Message already exists, skipping add for:',
                  mobileNo,
                );
              }

              // Update cache
              AsyncStorage.setItem('ownChats', JSON.stringify(updatedChats));

              return updatedChats;
            });

            // Increment unread count
            setUnreadCounts(prev => ({
              ...prev,
              [msg.ClientMobileno]: (prev[msg.ClientMobileno] || 0) + 1,
            }));
            console.log('Incremented unread count for:', msg.ClientMobileno);
          } else {
            console.log(
              'Ignoring non-received message or missing ClientMobileno',
            );
          }
        } catch (err) {
          console.error('WebSocket parsing error:', err);
        }
      };

      ws.current.onerror = err => {
        console.error('Global WebSocket connection error occurred:', err);
      };

      ws.current.onclose = e => {
        console.warn(
          'Global WebSocket Closed. Code:',
          e.code,
          'Reason:',
          e.reason,
        );
        ws.current = null;
        if (e.code !== 1000 && !reconnectTimeoutRef.current) {
          console.log('Scheduling reconnection in 3s...');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting Global WebSocket reconnection...');
            setupWebSocket();
          }, 3000);
        }
      };
    });
  }, [user]);

  useEffect(() => {
    if (authenticated && user) {
      setupWebSocket();
    }
    // No cleanup to keep WebSocket persistent
  }, [setupWebSocket, authenticated, user]);

  const loadChats = useCallback(async (forceRefresh = false) => {
    console.log('Loading chats, forceRefresh:', forceRefresh);
    try {
      if (!forceRefresh) {
        const cachedChats = await AsyncStorage.getItem('ownChats');
        if (cachedChats) {
          console.log('Loaded from cache');
          setContactList(JSON.parse(cachedChats));
          setIsLoading(false);
        }
      }

      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        console.log('No user in AsyncStorage, skipping API call');
        return;
      }
      const { WhatsAppSenderID, LoginID } = JSON.parse(userStr);
      console.log('Using senderID from storage:', WhatsAppSenderID);

      const url = `${API_URL}/GetOwnChatForLogID?senderNo=${WhatsAppSenderID}&LoginId=${LoginID}&date=`;
      console.log('Fetching from URL:', url);
      const response = await fetch(url, { method: 'POST' });
      const result = await response.json();
      console.log('API Response:', result);

      if (result && Array.isArray(result.Data)) {
        const newRawDataString = JSON.stringify(result.Data);
        const oldRawDataString = await AsyncStorage.getItem('rawOwnChats');

        if (newRawDataString !== oldRawDataString || forceRefresh) {
          console.log('Data changed or force refresh, updating...');
          const groupedChats = groupChatsByMobileNo(result.Data);
          setContactList(groupedChats);
          await AsyncStorage.setItem('ownChats', JSON.stringify(groupedChats));
          await AsyncStorage.setItem('rawOwnChats', newRawDataString);
        } else {
          console.log('No data change, skipping update');
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
    console.log('Manual refresh triggered');
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
        profileName: latestChat.ProfileName || '',
        lastMessage: latestChat.MessageText?.slice(0, 40) || 'Attachment',
        lastDate: latestChat.ProcessDate
          ? new Date(latestChat.ProcessDate)
          : null,
        chats,
        unread: unreadCounts[number] || 0,
      };
    });
    return contactArray
      .map(chat => ({
        ...chat,
        lastDateLabel: getDateLabel(chat.lastDate),
      }))
      .sort((a, b) => (b.lastDate || 0) - (a.lastDate || 0));
  }, [contactList, unreadCounts]);

  const filteredContacts = useMemo(() => {
    if (!search) return sortedContactArray;
    return sortedContactArray.filter(
      chat =>
        chat.number.includes(search) ||
        (chat.profileName &&
          chat.profileName.toLowerCase().includes(search.toLowerCase())) ||
        chat.lastMessage.toLowerCase().includes(search.toLowerCase()),
    );
  }, [sortedContactArray, search]);

  const handleLogout = async () => {
    setShowModal(false);
    // Close WebSocket before logout
    await closeWebSocket(ws, reconnectTimeoutRef);
    await logout(navigation);
  };

  const navigateToChat = useCallback(
    item => {
      // Mark as read
      setUnreadCounts(prev => ({ ...prev, [item.number]: 0 }));
      console.log('Marked as read for:', item.number);
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
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 20,
    borderColor: '#eee',
  },
  unreadItem: {
    backgroundColor: '#D5F0C0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unreadTextBold: {
    fontWeight: 'bold',
    color: '#000',
  },
  chatInfo: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactNameContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  number: {
    fontSize: 14,
    color: '#666',
  },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 2 },
  lastDate: { fontSize: 12, color: '#888', textAlign: 'right' },
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
