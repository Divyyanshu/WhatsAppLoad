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
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../Context/UserContext';
import { API_URL } from '../config';
import TopBar from '../Components/TopBar';
import WhatsAppLoaders from '../Components/WhatsAppLoaders';
import { COLORS } from '../Constants/Colors';
import { useRoute } from '@react-navigation/native';

// --- Utility to close WebSocket gracefully ---
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

// --- Utilities ---
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
  return chatsArray.reduce((grouped, chat) => {
    const mobile = chat.ClientMobileno;
    if (!grouped[mobile]) grouped[mobile] = [];
    grouped[mobile].push(chat);
    return grouped;
  }, {});
};

// --- ChatItem ---
const ChatItem = React.memo(({ item, index, onPress, onLongPress }) => {
  const unread = item.unread || 0;
  const isUnread = unread > 0;

  return (
    <TouchableOpacity
      style={[styles.item, isUnread && styles.unreadItem]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      activeOpacity={0.7}
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contactList, setContactList] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [profileMap, setProfileMap] = useState({});
  const [selectedNumber, setSelectedNumber] = useState('');
  const [profileInput, setProfileInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const route = useRoute();

  const { user, logout, authenticated } = useContext(UserContext);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  console.log('Current user from context:', user);

  // --- Fetch Profile Names (merged, safe) ---
  const fetchProfileNames = useCallback(async () => {
    try {
      if (!user?.WhatsAppSenderID) {
        console.log('Skipping GetUserProfileName — sender not ready');
        return;
      }

      const data = JSON.stringify({ SenderID: user.WhatsAppSenderID });
      const response = await fetch(
        'https://www.loadcrm.com/whatsappmobileapis/api/GetUserProfileName',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
        },
      );

      const result = await response.json();
      if (result?.Message === 'Success' && Array.isArray(result?.Data)) {
        const updatedProfiles = { ...profileMap };
        result.Data.forEach(item => {
          if (item.ClientMobileNumber && item.ProfileName) {
            updatedProfiles[item.ClientMobileNumber] = item.ProfileName;
          }
        });
        setProfileMap(updatedProfiles);
        await AsyncStorage.setItem(
          'profileMap',
          JSON.stringify(updatedProfiles),
        );
        console.log('✅ Profile map merged and cached successfully');
      } else {
        console.log('⚠️ No valid data found in GetUserProfileName');
      }
    } catch (err) {
      console.error('Error fetching profile names:', err);
    }
  }, [user]);

  // --- Load profile cache & fetch ---
  useEffect(() => {
    (async () => {
      const cachedProfiles = await AsyncStorage.getItem('profileMap');
      if (cachedProfiles) {
        setProfileMap(JSON.parse(cachedProfiles));
        console.log('Loaded cached profile map');
      }
      await fetchProfileNames();
    })();
  }, [fetchProfileNames]);

  // --- WebSocket Setup ---
  const setupWebSocket = useCallback(() => {
    if (!user || !user.WhatsAppSenderID) {
      console.log('User not ready for WS');
      return;
    }

    closeWebSocket(ws, reconnectTimeoutRef).then(() => {
      const wsUrl = `wss://www.loadcrm.com/whatsappwebsocket/ws/global?senderNumber=${user.WhatsAppSenderID}&sysIpAddress=192.168.1.100&user=app`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Global WebSocket Connected successfully');
        setIsConnected(true);
      };

      ws.current.onmessage = e => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.Mode === 'Received' && msg.ClientMobileno) {
            setContactList(prev => {
              const mobile = msg.ClientMobileno;
              const updated = { ...prev };
              if (!updated[mobile]) updated[mobile] = [];
              const id = msg.id || msg.Uid;
              const exists = updated[mobile].some(c => (c.id || c.Uid) === id);
              if (!exists) updated[mobile].push(msg);
              AsyncStorage.setItem('ownChats', JSON.stringify(updated));
              return updated;
            });
            setUnreadCounts(prev => ({
              ...prev,
              [msg.ClientMobileno]: (prev[msg.ClientMobileno] || 0) + 1,
            }));
          }
        } catch (err) {
          console.error('WS parsing error:', err);
        }
      };

      ws.current.onerror = err => {
        console.error('WebSocket error:', err);
        setIsConnected(false);
      };

      ws.current.onclose = e => {
        console.warn('Global WebSocket Closed:', e.code, e.reason);
        setIsConnected(false);
        ws.current = null;
        if (e.code !== 1000 && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(setupWebSocket, 3000);
        }
      };
    });
  }, [user]);

  useEffect(() => {
    if (authenticated && user?.WhatsAppSenderID) setupWebSocket();
    return () => closeWebSocket(ws, reconnectTimeoutRef);
  }, [setupWebSocket, authenticated, user]);

  // --- Load Chats API ---
  const loadChats = useCallback(async (force = false) => {
    try {
      if (!force) {
        const cached = await AsyncStorage.getItem('ownChats');
        if (cached) {
          setContactList(JSON.parse(cached));
          setIsLoading(false);
        }
      }
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const { WhatsAppSenderID, LoginID } = JSON.parse(userStr);
      const url = `${API_URL}/GetOwnChatForLogID?senderNo=${WhatsAppSenderID}&LoginId=${LoginID}&date=`;
      const res = await fetch(url, { method: 'POST' });
      const result = await res.json();
      if (result && Array.isArray(result.Data)) {
        const grouped = groupChatsByMobileNo(result.Data);
        setContactList(grouped);
        await AsyncStorage.setItem('ownChats', JSON.stringify(grouped));
      }
    } catch (err) {
      console.error('Error loading chats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // --- Refresh Handler ---
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadChats(true);
    await fetchProfileNames();
    setIsRefreshing(false);
  }, [loadChats, fetchProfileNames]);

  // --- Save Profile Handler ---
  const handleSaveProfile = useCallback(async () => {
    if (!profileInput.trim() || !user?.WhatsAppSenderID || !selectedNumber) {
      Alert.alert('Error', 'Please enter a valid profile name');
      return;
    }

    setIsSavingProfile(true);
    try {
      const data = JSON.stringify({
        SenderId: user.WhatsAppSenderID,
        ClientId: selectedNumber,
        ProfileName: profileInput.trim(),
      });

      const response = await fetch(
        'https://www.loadcrm.com/whatsappmobileapis/api/AddUserProfileName',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
        },
      );

      const result = await response.json();

      if (result?.Message === 'Success') {
        const newMap = { ...profileMap, [selectedNumber]: profileInput.trim() };
        setProfileMap(newMap);
        await AsyncStorage.setItem('profileMap', JSON.stringify(newMap));
        await handleRefresh();
        setShowProfileModal(false);
        setProfileInput('');
        Alert.alert('Success', 'Profile name saved successfully');
      } else {
        Alert.alert('Error', 'Failed to save profile name');
        console.log('Failed to save profile:', result);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error occurred');
      console.error('Error saving profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  }, [profileInput, user, selectedNumber, profileMap, handleRefresh]);

  // --- Long Press Handler ---
  const handleLongPress = useCallback(
    item => {
      setSelectedNumber(item.number);
      setProfileInput(profileMap[item.number] || '');
      setShowProfileModal(true);
    },
    [profileMap],
  );

  // --- Derived Data ---
  const sortedContactArray = useMemo(() => {
    const arr = Object.keys(contactList).map(number => {
      const chats = contactList[number];
      const latest = chats.reduce((a, b) =>
        new Date(a.ProcessDate) > new Date(b.ProcessDate) ? a : b,
      );
      return {
        number,
        profileName: latest.ProfileName || profileMap[number] || '',
        lastMessage: latest.MessageText?.slice(0, 40) || 'Attachment',
        lastDate: latest.ProcessDate ? new Date(latest.ProcessDate) : null,
        chats,
        unread: unreadCounts[number] || 0,
      };
    });
    return arr
      .map(c => ({ ...c, lastDateLabel: getDateLabel(c.lastDate) }))
      .sort((a, b) => (b.lastDate || 0) - (a.lastDate || 0));
  }, [contactList, unreadCounts, profileMap]);

  const filteredContacts = useMemo(() => {
    if (!search) return sortedContactArray;
    return sortedContactArray.filter(
      c =>
        c.number.includes(search) ||
        (c.profileName &&
          c.profileName.toLowerCase().includes(search.toLowerCase())) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase()),
    );
  }, [sortedContactArray, search]);

  const handleLogout = async () => {
    setShowModal(false);
    await closeWebSocket(ws, reconnectTimeoutRef);
    await logout(navigation);
  };

  const navigateToChat = useCallback(
    item => {
      setUnreadCounts(prev => ({ ...prev, [item.number]: 0 }));
      navigation.navigate('ChatScreen', {
        number: item.number,
        chats: item.chats,
      });
    },
    [navigation],
  );

  const renderChatItem = useCallback(
    ({ item, index }) => (
      <ChatItem
        item={item}
        index={index}
        onPress={navigateToChat}
        onLongPress={handleLongPress}
      />
    ),
    [navigateToChat, handleLongPress],
  );

  // --- UI ---
  return (
    <View style={styles.container}>
      <TopBar
        title="Own Chats"
        onLogoutPress={() => setShowModal(true)}
        isConnected={isConnected}
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
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
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
      <Modal visible={showModal} transparent animationType="fade">
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

      {/* Profile Save Modal */}
      {/* Profile Save Modal */}
      <Modal visible={showProfileModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '70%' }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Profile Name</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProfileModal(false);
                  setProfileInput('');
                }}
                style={styles.closeButton}
              >
                <Feather name="x" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Input */}
            <TextInput
              style={styles.profileInput}
              placeholder="Enter profile name"
              placeholderTextColor="#888"
              value={profileInput}
              onChangeText={setProfileInput}
              autoFocus={true}
              editable={!isSavingProfile}
            />

            {/* Save Button with Loader */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                isSavingProfile && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveProfile}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  statusBar: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
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
  clearIcon: { paddingHorizontal: 8, opacity: 0.8 },
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
  unreadItem: { backgroundColor: '#E6FFE6' },
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
  unreadBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  unreadTextBold: { fontWeight: 'bold', color: '#000' },
  chatInfo: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactNameContainer: { flex: 1, flexDirection: 'column' },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  number: { fontSize: 14, color: '#666' },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 2 },
  lastDate: { fontSize: 12, color: '#888', textAlign: 'right' },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: { color: '#333', fontWeight: 'bold' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  profileInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  closeButton: {
    padding: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
});

export default OwnChat;
