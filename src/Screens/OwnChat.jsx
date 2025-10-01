import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, RefreshControl } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from '../Context/UserContext';

const API_URL = 'https://www.loadcrm.com/whatsappmobileapis/api';

// --- Utility Functions (moved outside the component) ---
const pad = n => (n < 10 ? '0' + n : n);

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
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

const groupChatsByMobileNo = (chatsArray) => {
  if (!Array.isArray(chatsArray)) return {};
  return chatsArray.reduce((groupedData, currentChat) => {
    const mobileNo = currentChat.ClientMobileno;
    if (!groupedData[mobileNo]) {
      groupedData[mobileNo] = [];
    }
    groupedData[mobileNo].push(currentChat);
    return groupedData;
  }, {});
};

// 🚀 1. Create a memoized ChatItem component for the list
const ChatItem = React.memo(({ item, index, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={() => onPress(item)}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{index + 1}</Text>
          {/* <View style={styles.avatar}><Text style={styles.avatarText}>{index + 1}</Text></View> */}

    </View>
    <View style={styles.chatInfo}>
      <View style={styles.chatHeader}>
        <Text style={styles.number}>{item.number}</Text>
        <Text style={styles.lastDate}>{item.lastDateLabel}</Text>
      </View>
      <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
    </View>
  </TouchableOpacity>
));

const OwnChat = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contactList, setContactList] = useState({}); // Stores the grouped chats object

    const { user,logout,authenticated } = useContext(UserContext);
  console.log("User in ownchat:", authenticated, user);


  // 🚀 2. Caching logic: Load from storage, then fetch for updates
  const loadChats = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      // First, try loading from cache for instant UI
      const cachedChats = await AsyncStorage.getItem('ownChats');
      if (cachedChats) {
        setContactList(JSON.parse(cachedChats));
      }
    }

    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const { WhatsAppSenderID, LoginID } = JSON.parse(userStr);
      
      const url = `${API_URL}/GetOwnChatForLogID?senderNo=${WhatsAppSenderID}&LoginId=${LoginID}&date=`;
      const response = await fetch(url, { method: 'POST' });
      const result = await response.json();
      // console.log('Fetched OwnChat API result:', result?.Data?.length || 0);
      // console.log('Fetched OwnChat API result:', result?.Data );

      if (result && Array.isArray(result.Data)) {
        // Compare new raw data with previously stored raw data
        const newRawDataString = JSON.stringify(result.Data);
        const oldRawDataString = await AsyncStorage.getItem('rawOwnChats');
        // console.log("New Raw Data:", newRawDataString);
        // console.log("Old Raw Data:", oldRawDataString);
        if (newRawDataString !== oldRawDataString || forceRefresh) {
          console.log("Data has changed. Updating UI and cache.");
          // console.log(newRawDataString !== oldRawDataString)
          const groupedChats = groupChatsByMobileNo(result.Data);
          setContactList(groupedChats);
          await AsyncStorage.setItem('ownChats', JSON.stringify(groupedChats));
          await AsyncStorage.setItem('rawOwnChats', newRawDataString);
        } else {
           console.log("No changes in data.");
        }
      }
    } catch (error) {
      console.error('Error fetching OwnChat API:', error);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // 🚀 3. Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadChats(true); // Force refresh
    setIsRefreshing(false);
  }, [loadChats]);

  // 🧠 4. Memoize the expensive transformation and sorting
  const sortedContactArray = useMemo(() => {
    const contactArray = Object.keys(contactList).map(number => {
      const chats = contactList[number];
      const latestChat = chats.reduce((latest, current) => 
         new Date(latest.ProcessDate) > new Date(current.ProcessDate) ? latest : current
      );
      return {
        number,
        lastMessage: latestChat.MessageText?.slice(0, 40) || 'Attachment',
        lastDate: latestChat.ProcessDate ? new Date(latestChat.ProcessDate) : null,
        chats, // Pass all chats for this number
      };
    }).map(chat => ({
      ...chat,
      lastDateLabel: getDateLabel(chat.lastDate),
    }));

    // Sort by lastDate descending (latest first)
    return contactArray.sort((a, b) => (b.lastDate || 0) - (a.lastDate || 0));
  }, [contactList]);

  // 🧠 5. Memoize the filtering logic
  const filteredContacts = useMemo(() => {
    if (!search) {
      return sortedContactArray;
    }
    return sortedContactArray.filter(chat =>
      chat.number.includes(search) ||
      chat.lastMessage.toLowerCase().includes(search.toLowerCase())
    );
  }, [sortedContactArray, search]);

  const handleLogout = async () => {
    setShowModal(false);
    await logout(navigation);
  };
  
  const navigateToChat = useCallback((item) => {
    navigation.navigate('ChatScreen', { number: item.number, chats: item.chats });
  }, [navigation]);

  // ⚙️ 6. Stabilize renderItem with useCallback
  const renderChatItem = useCallback(({ item, index }) => (
     <ChatItem item={item} index={index} onPress={navigateToChat} />
  ), [navigateToChat]);


    const checkAsyncStorage = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage Keys:', allKeys);

      // for (const key of allKeys) {
      //   const value = await AsyncStorage.getItem(key);
      //   console.log(`Key: ${key}, Value: ${value}`);
      // }
    } catch (error) {
      console.error('Error retrieving AsyncStorage data:', error);
    }
  };

  // Call this function in your component's lifecycle or a button press
  // For example, in a useEffect hook:
  useEffect(() => {
    checkAsyncStorage();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header and Search UI (unchanged) */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Own Chats</Text>
        <TouchableOpacity style={styles.logoutIcon} onPress={() => setShowModal(true)}>
          <Feather name="log-out" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Feather name="search" size={20} color="#888" style={styles.searchIconWrap} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            inputMode='numeric'
          />
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.number}
        renderItem={renderChatItem}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        refreshControl={ // Pull-to-refresh component
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#b3a0e0']}
          />
        }
      />

      {/* Improved Logout Modal Design */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { elevation: 8, shadowColor: '#b3a0e0', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }]}>  
            <Feather name="alert-circle" size={48} color="#d01623ff" style={{ marginBottom: 12 }} />
            <Text style={[styles.modalText, { fontWeight: 'bold', fontSize: 20 }]}>Logout?</Text>
            <Text style={{ color: '#666', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>Are you sure you want to logout from your account?</Text>
            <View style={[styles.modalActions, { marginTop: 8 }]}>  
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#f2f2f2', borderRadius: 8, marginRight: 8 }]} onPress={() => setShowModal(false)}>
                <Text style={[styles.cancelText, { fontSize: 16 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#d01623ff', borderRadius: 8, marginLeft: 8 }]} onPress={handleLogout}>
                <Text style={[styles.logoutText, { color: '#fff', fontSize: 16 }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (Keep your existing styles)
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16 },
  header: { fontSize: 22, fontWeight: 'bold' },
  logoutIcon: { padding: 6 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 20, height: 50, paddingHorizontal: 8 },
  searchIconWrap: { paddingHorizontal: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#222' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 2 },
  lastDate: { fontSize: 12, color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 280, alignItems: 'center' },
  modalText: { fontSize: 18, marginBottom: 20, color: '#333', textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
  logoutText: { color: '#b3a0e0', fontSize: 16, fontWeight: 'bold' },
});

export default OwnChat;

// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
// import Feather from 'react-native-vector-icons/Feather';
// import AsyncStorage from "@react-native-async-storage/async-storage"

// // Static list of 50 sample chats
// const pad = n => n < 10 ? '0' + n : n;
// function getDateLabel(date) {
//   const today = new Date();
//   const yesterday = new Date();
//   yesterday.setDate(today.getDate() - 1);
//   if (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   ) {
//     return pad(date.getHours()) + ':' + pad(date.getMinutes());
//   } else if (
//     date.getDate() === yesterday.getDate() &&
//     date.getMonth() === yesterday.getMonth() &&
//     date.getFullYear() === yesterday.getFullYear()
//   ) {
//     return 'Yesterday';
//   } else {
//     return pad(date.getDate()) + '-' + pad(date.getMonth() + 1) + '-' + date.getFullYear();
//   }
// }
// // Store all chat data in a single array of objects
// const now = new Date();
// const API_URL = 'https://www.loadcrm.com/whatsappmobileapis/api';

// // Add lastDateLabel for each
// sampleNumbers.forEach(chat => {
//   chat.lastDateLabel = getDateLabel(chat.lastDate);
// });

// const OwnChat = ({ navigation }) => {
//   const [search, setSearch] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   // Add state for API data
//   const [apiData, setApiData] = useState(null);
//   const [contactList, setContactList] = useState([]);

//   const fetchOwnChat = async () => {
//     try {
//       const userStr = await AsyncStorage.getItem('user');
//       if (!userStr) return;
//       const user = JSON.parse(userStr);
//       const senderNo = user.WhatsAppSenderID;
//       const LoginId = user.LoginID;
//       const date = ''; // You can set a date string if needed

//       const url = `${API_URL}/GetOwnChatForLogID?senderNo=${senderNo}&LoginId=${LoginId}&date=${date}`;
//       const response = await fetch(url, { method: 'POST' });
//       const result = await response.json();
//       setApiData(result);
//       console.log('OwnChat API result:', result.Data);

//       // The function to group the data
//       const groupChatsByMobileNo = (chatsArray) => {
//         return chatsArray.reduce((groupedData, currentChat) => {
//           const mobileNo = currentChat.ClientMobileno;
//           if (!groupedData[mobileNo]) {
//             groupedData[mobileNo] = [];
//           }
//           groupedData[mobileNo].push(currentChat);
//           return groupedData;
//         }, {});
//       };

//       // Calling the function with your data
//       const groupedChats = groupChatsByMobileNo(result.Data);
//       setContactList(groupedChats)
//       await AsyncStorage.setItem('ownChats', JSON.stringify(groupedChats));

//       // Log the result to see the new structure
//       // console.log(Object.keys(groupedChats).length);
//       // console.log('Grouped Chats object:', groupedChats);

//     } catch (error) {
//       console.error('Error fetching OwnChat API:', error);
//     }
//   };

//   // for checking all AsyncStorage data in console
//   const checkAsyncStorage = async () => {
//     try {
//       const allKeys = await AsyncStorage.getAllKeys();
//       console.log('All AsyncStorage Keys:', allKeys);

//       // for (const key of allKeys) {
//       //   const value = await AsyncStorage.getItem(key);
//       //   console.log(`Key: ${key}, Value: ${value}`);
//       // }
//     } catch (error) {
//       console.error('Error retrieving AsyncStorage data:', error);
//     }
//   };

//   // Call this function in your component's lifecycle or a button press
//   // For example, in a useEffect hook:
//   useEffect(() => {
//     fetchOwnChat();
//     checkAsyncStorage();
//   }, []);

//   // Convert contactList object to array for FlatList
//   let contactArray = Object.keys(contactList).map(number => {
//     const chats = contactList[number];
//     const latestChat = chats[chats.length - 1]; // or chats[0] if newest is first
//     return {
//       number,
//       lastMessage: latestChat.MessageText.slice(0, 30) || 'Latest message', // adjust property name if needed
//       lastDate: latestChat.ProcessDate ? new Date(latestChat.ProcessDate) : null,
//       lastDateLabel: latestChat.ProcessDate ? getDateLabel(new Date(latestChat.ProcessDate)) : '',
//       chats: chats,
//     };
//   });

//   // Sort by lastDate descending (latest first)
//   contactArray = contactArray.sort((a, b) => {
//     if (!a.lastDate) return 1;
//     if (!b.lastDate) return -1;
//     return b.lastDate - a.lastDate;
//   });

//   console.log('contactArray:', contactArray);

//   // Filter API data based on search
//   const filteredNumbers = contactArray.filter(chat =>
//     chat.number.includes(search)
//     || chat.lastMessage.toLowerCase().includes(search.toLowerCase())
//   );


//   // logout function
//   const handleLogout = () => {
//     setShowModal(false);
//     AsyncStorage.removeItem('user');
//     AsyncStorage.removeItem('ownChats');
//     navigation.replace('Login');
//   };



//   return (
//     <View style={styles.container}>
//       <View style={styles.headerRow}>
//         <Text style={styles.header}>Own Chats</Text>
//         <TouchableOpacity style={styles.logoutIcon} onPress={() => setShowModal(true)}>
//           {/* <Text style={{ fontSize: 22, color: '#333' }}>⎋</Text> */}
//           <Feather name="log-out" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.searchContainer}>
//         <View style={styles.searchRow}>
//           <View style={styles.searchIconWrap}>
//             <Feather name="search" size={20} color="#888" />
//           </View>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search"
//             value={search}
//             onChangeText={setSearch}
//           />
//         </View>
//       </View>
//       <FlatList
//         data={filteredNumbers}
//         keyExtractor={item => item.number}
//         renderItem={({ item, index }) => (
//           <TouchableOpacity
//             style={styles.item}
//             onPress={() => navigation.navigate('ChatScreen', { number: item.number, chats: item.chats })}
//           >
//             <View style={styles.avatar}><Text style={styles.avatarText}>{index + 1}</Text></View>
//             <View style={{ flex: 1 }}>
//               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Text style={styles.number}>{item.number}</Text>
//                 <Text style={styles.lastDate}>{item.lastDateLabel}</Text>
//               </View>
//               <Text style={styles.lastMessage}>{item.lastMessage}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//         contentContainerStyle={{ padding: 10 }}
//       />


//       {/* to show number with sample data of number  */}
//       {/*
//       <View style={styles.searchContainer}>
//         <View style={styles.searchRow}>
//           <View style={styles.searchIconWrap}>
//             <Feather name="search" size={20} color="#888" />
//           </View>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search"
//             value={search}
//             onChangeText={setSearch}
//           />
//         </View>
//       </View>
//       <FlatList
//         data={filteredNumbers}
//         keyExtractor={item => item.number}
//         renderItem={({ item, index }) => (
//           <TouchableOpacity
//             style={styles.item}
//             onPress={() => navigation.navigate('ChatScreen', { number: item.number })}
//           >
//             <View style={styles.avatar}><Text style={styles.avatarText}>{index + 1}</Text></View>
//             <View style={{ flex: 1 }}>
//               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Text style={styles.number}>{item.number}</Text>
//                 <Text style={styles.lastDate}>{item.lastDateLabel}</Text>
//               </View>
//               <Text style={styles.lastMessage}>{item.lastMessage}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//         contentContainerStyle={{ padding: 10 }}
//       />
//        */}

//       {/* modal for logout option */}
//       <Modal
//         visible={showModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalText}>Are you sure you want to logout?</Text>
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
//                 <Text style={styles.logoutText}>Logout</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     margin: 16,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
//   logoutIcon: {
//     padding: 6,
//     borderRadius: 20,
//     // backgroundColor: '#e0e0e0',
//   },
//   searchContainer: {
//     paddingHorizontal: 16,
//     // paddingVertical: 8,
//     marginBottom: 4,
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f2f2f2',
//     // paddingVertical: 8,
//     borderRadius: 20,
//     height: 50,
//     paddingHorizontal: 8,
//   },
//   searchIconWrap: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 32,
//     height: 40,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingHorizontal: 8,
//     color: '#222',
//     backgroundColor: 'transparent',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 24,
//     width: 280,
//     alignItems: 'center',
//   },
//   modalText: {
//     fontSize: 18,
//     marginBottom: 20,
//     color: '#333',
//     textAlign: 'center',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   modalButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   cancelText: {
//     color: '#888',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   logoutText: {
//     color: '#b3a0e0',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   item: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 26,
//     backgroundColor: '#e0e0e0',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     fontSize: 18,
//     color: '#333',
//     fontWeight: 'bold',
//   },
//   number: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#222',
//   },
//   lastMessage: {
//     fontSize: 13,
//     color: '#888',
//     marginTop: 2,
//   },
//   lastDate: {
//     fontSize: 13,
//     color: '#888',
//     marginLeft: 8,
//   },
// });

// export default OwnChat;