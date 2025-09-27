import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from "@react-native-async-storage/async-storage"

// Static list of 50 sample chats
const pad = n => n < 10 ? '0' + n : n;
function getDateLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes());
  } else if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  } else {
    return pad(date.getDate()) + '-' + pad(date.getMonth() + 1) + '-' + date.getFullYear();
  }
}

// Store all chat data in a single array of objects
const now = new Date();
const API_URL = 'https://www.loadcrm.com/whatsappmobileapis/api';

const sampleNumbers = [
  {
    number: '919876543210', lastMessage: 'Hey, how are you?', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 15)
  },
  {
    number: '919876543211', lastMessage: 'Meeting at 5?', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 20)
  },
  {
    number: '919876543212', lastMessage: 'Send the files.', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30)
  },
  {
    number: '919876543213', lastMessage: 'Lunch?', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 45)
  },
  {
    number: '919876543214', lastMessage: 'See you soon!', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 10)
  },
  {
    number: '919876543215', lastMessage: 'Call me.', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 5)
  },
  {
    number: '919876543216', lastMessage: 'Got it.', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 25)
  },
  {
    number: '919876543217', lastMessage: 'Thanks!', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 40)
  },
  {
    number: '919876543218', lastMessage: 'On my way.', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 55)
  },
  {
    number: '919876543219', lastMessage: 'Let’s meet.', lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 10)
  },
  // 20 yesterday
  ...Array.from({ length: 20 }, (_, i) => ({
    number: '91987654322' + pad(i),
    lastMessage: `Yesterday message ${i + 1}`,
    lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 30)
  })),
  // 20 older
  ...Array.from({ length: 20 }, (_, i) => ({
    number: '91987655564' + pad(i),
    lastMessage: `Older message ${i + 1}`,
    lastDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 2), 8, 0)
  })),
];


// Add lastDateLabel for each
sampleNumbers.forEach(chat => {
  chat.lastDateLabel = getDateLabel(chat.lastDate);
});

const OwnChat = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  // Add state for API data
  const [apiData, setApiData] = useState(null);
  const [contactList, setContactList] = useState([]);


  const fetchOwnChat = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const senderNo = user.WhatsAppSenderID;
      const LoginId = user.LoginID;
      const date = ''; // You can set a date string if needed

      const url = `${API_URL}/GetOwnChatForLogID?senderNo=${senderNo}&LoginId=${LoginId}&date=${date}`;
      const response = await fetch(url, { method: 'POST' });
      const result = await response.json();
      setApiData(result);
      console.log('OwnChat API result:', result.Data);

      // The function to group the data
      const groupChatsByMobileNo = (chatsArray) => {
        return chatsArray.reduce((groupedData, currentChat) => {
          const mobileNo = currentChat.ClientMobileno;
          if (!groupedData[mobileNo]) {
            groupedData[mobileNo] = [];
          }
          groupedData[mobileNo].push(currentChat);
          return groupedData;
        }, {});
      };

      // Calling the function with your data
      const groupedChats = groupChatsByMobileNo(result.Data);
      setContactList(groupedChats)
      // Log the result to see the new structure
      console.log(Object.keys(groupedChats).length);
      console.log(groupedChats);

    } catch (error) {
      console.error('Error fetching OwnChat API:', error);
    }
  };

  // for checking all AsyncStorage data in console
  const checkAsyncStorage = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage Keys:', allKeys);

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`Key: ${key}, Value: ${value}`);
      }
    } catch (error) {
      console.error('Error retrieving AsyncStorage data:', error);
    }
  };

  // Call this function in your component's lifecycle or a button press
  // For example, in a useEffect hook:
  useEffect(() => {
    fetchOwnChat();
    checkAsyncStorage();
  }, []);

  // Convert contactList object to array for FlatList
  const contactArray = Object.keys(contactList).map(number => {
    const chats = contactList[number];
    const latestChat = chats[chats.length - 1]; // or chats[0] if newest is first
    return {
      number,
      lastMessage: latestChat.MessageText.slice(0, 30) || '', // adjust property name if needed
      lastDate: latestChat.ProcessDate ? new Date(latestChat.ProcessDate) : null,
      lastDateLabel: latestChat.ProcessDate ? getDateLabel(new Date(latestChat.ProcessDate)) : '',
      chats: chats,
    };
  });

  console.log('contactArray:', contactArray);
  
  // Filter API data based on search
  const filteredNumbers = contactArray.filter(chat =>
    chat.number.includes(search)
    || chat.lastMessage.toLowerCase().includes(search.toLowerCase())
  );


  // logout function
  const handleLogout = () => {
    setShowModal(false);
    AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };




  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Own Chats</Text>
        <TouchableOpacity style={styles.logoutIcon} onPress={() => setShowModal(true)}>
          {/* <Text style={{ fontSize: 22, color: '#333' }}>⎋</Text> */}
          <Feather name="log-out" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchIconWrap}>
            <Feather name="search" size={20} color="#888" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={filteredNumbers}
        keyExtractor={item => item.number}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('ChatScreen', { number: item.number, chats: item.chats })}
          >
            <View style={styles.avatar}><Text style={styles.avatarText}>{index + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.number}>{item.number}</Text>
                <Text style={styles.lastDate}>{item.lastDateLabel}</Text>
              </View>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 10 }}
      />


      {/* to show number with sample data of number  */}
      {/*
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchIconWrap}>
            <Feather name="search" size={20} color="#888" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={filteredNumbers}
        keyExtractor={item => item.number}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('ChatScreen', { number: item.number })}
          >
            <View style={styles.avatar}><Text style={styles.avatarText}>{index + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.number}>{item.number}</Text>
                <Text style={styles.lastDate}>{item.lastDateLabel}</Text>
              </View>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 10 }}
      />
       */}

      {/* modal for logout option */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutIcon: {
    padding: 6,
    borderRadius: 20,
    // backgroundColor: '#e0e0e0',
  },
  searchContainer: {
    paddingHorizontal: 16,
    // paddingVertical: 8,
    marginBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    // paddingVertical: 8,
    borderRadius: 20,
    height: 50,
    paddingHorizontal: 8,
  },
  searchIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    color: '#222',
    backgroundColor: 'transparent',
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
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
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
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#b3a0e0',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
    borderRadius: 26,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  number: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  lastMessage: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  lastDate: {
    fontSize: 13,
    color: '#888',
    marginLeft: 8,
  },
});

export default OwnChat;