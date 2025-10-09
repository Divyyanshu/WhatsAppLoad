// import React, { useContext, useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   SectionList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
// } from 'react-native';
// import { COLORS } from '../Constants/Colors';
// import Feather from 'react-native-vector-icons/Feather';
// import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
// import { useNavigation } from '@react-navigation/native';
// import { UserContext } from '../Context/UserContext';
// import { API_URL } from '../config';
// import WhatsAppLoaders from '../Components/WhatsAppLoaders';

// function groupChatsByDate(chats) {
//   const groups = {};
//   chats.forEach(chat => {
//     const dateObj = chat.ProcessDate ? new Date(chat.ProcessDate) : null;
//     if (!dateObj) return;
//     const dateLabel = dateObj.toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//     });
//     if (!groups[dateLabel]) groups[dateLabel] = [];
//     groups[dateLabel].push(chat);
//   });
//   return Object.keys(groups).map(date => ({
//     date,
//     data: groups[date],
//   }));
// }

// const ChatScreen = ({ route }) => {
//   const { number, chats } = route.params;

//   const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
//   const navigation = useNavigation();
//   const sectionListRef = useRef(null);
//   console.log('chats in chat screen:', chats);
//   const { user } = useContext(UserContext);
//   // Fetch eligibility
//   const checkEligibility = async () => {
//     try {
//       setLoading(true);
//       const senderNo = user.WhatsAppSenderID;
//       const response = await fetch(
//         `${API_URL}/checkLastuserMessage?senderid=${senderNo}&clientno=${number}`,
//         { method: 'POST' },
//       );
//       const data = await response.json();
//       if (data.Data === 'Yes') setCheckMessageEligibility(true);
//       else setCheckMessageEligibility(false);
//     } catch (error) {
//       console.error('Eligibility check failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     checkEligibility();
//   }, []);

//   const safeChats = Array.isArray(chats) ? chats : [];
//   const sections = groupChatsByDate(safeChats);

//   const handleSend = () => {
//     if (message.trim()) {
//       setMessage('');
//     }
//   };

//   const handleInputPress = () => {
//     if (!checkMessageEligibility) {
//       setModalVisible(true);
//     }
//   };

//   const handleModalOk = () => {
//     setModalVisible(false);
//     navigation.navigate('Templates', { number });
//   };

//   // Show loader while fetching eligibility
//   if (loading) {
//     return (
//       <View style={styles.loaderWrapper}>
//         <WhatsAppLoaders type="bar" color={COLORS.loader} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         {/* Back Button */}
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Feather name="arrow-left" size={30} color="#fff" />
//         </TouchableOpacity>

//         {/* Avatar and Name */}
//         <View
//           style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}
//         >
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>A</Text>
//           </View>
//           <Text style={styles.headerText}>{number}</Text>
//         </View>
//       </View>

//       {/* Chat Section */}
//       <SectionList
//         ref={sectionListRef}
//         sections={sections}
//         keyExtractor={item => item.id}
//         renderSectionHeader={({ section: { date } }) => (
//           <View style={styles.dateSection}>
//             <Text style={styles.dateSectionText}>{date}</Text>
//           </View>
//         )}
//         renderItem={({ item }) => (
//           <View
//             style={[
//               styles.messageContainer,
//               item.Mode === 'Send' ? styles.sent : styles.received,
//             ]}
//           >
//             <Text style={styles.messageText}>{item.MessageText}</Text>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'flex-end',
//               }}
//             >
//               <Text style={styles.messageTime}>
//                 {item.ProcessDate
//                   ? new Date(item.ProcessDate).toLocaleTimeString('en-IN', {
//                       hour: '2-digit',
//                       minute: '2-digit',
//                     })
//                   : ''}
//               </Text>
//               {item.Mode === 'Send' && (
//                 <FontAwesome6
//                   name={item.readstatus === 'read' ? 'check-double' : 'check'}
//                   size={16}
//                   color={
//                     item.readstatus === 'read' ? COLORS.light.primary : 'gray'
//                   }
//                   style={{ marginLeft: 4 }}
//                 />
//               )}
//             </View>
//           </View>
//         )}
//         contentContainerStyle={{ padding: 10 }}
//       />

//       {/* Input Section */}
//       <View style={styles.inputContainerTextMessage}>
//         {checkMessageEligibility ? (
//           <TextInput
//             style={styles.input}
//             placeholder="Type a message..."
//             value={message}
//             onChangeText={setMessage}
//             multiline={true}
//             placeholderTextColor="#888"
//           />
//         ) : (
//           <TouchableOpacity
//             style={styles.inputWrapper}
//             onPress={handleInputPress}
//             activeOpacity={0.7}
//           >
//             <TextInput
//               style={[styles.input, styles.disabledInput]}
//               placeholder="Type a message..."
//               value={message}
//               onChangeText={setMessage}
//               multiline={true}
//               placeholderTextColor="#888"
//               editable={false}
//             />
//           </TouchableOpacity>
//         )}
//         {checkMessageEligibility && (
//           <TouchableOpacity
//             style={styles.sendButton}
//             onPress={handleSend}
//             disabled={!message.trim()}
//           >
//             <Feather
//               name="send"
//               size={22}
//               color={message.trim() ? '#fff' : '#ccc'}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalText}>
//               To restart chat, send any approved message from the list.
//             </Text>
//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={handleModalOk}
//             >
//               <Text style={styles.modalButtonText}>OK</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   header: {
//     backgroundColor: COLORS.light.primary,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#e0e0e0',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   avatarText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
//   messageContainer: {
//     marginVertical: 6,
//     maxWidth: '80%',
//     borderRadius: 10,
//     padding: 10,
//   },
//   sent: {
//     backgroundColor: '#d1f7c4',
//     alignSelf: 'flex-end',
//   },
//   received: {
//     backgroundColor: '#fff',
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   messageTime: {
//     fontSize: 12,
//     color: '#888',
//     alignSelf: 'flex-end',
//   },
//   inputContainerTextMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     margin: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   inputWrapper: {
//     flex: 1,
//   },
//   sendButton: {
//     backgroundColor: COLORS.light.primary,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   input: {
//     flex: 1,
//     minHeight: 40,
//     maxHeight: 120,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     fontSize: 16,
//     color: '#333',
//   },
//   disabledInput: {
//     backgroundColor: '#f0f0f0',
//     opacity: 0.6,
//   },
//   dateSection: {
//     alignSelf: 'center',
//     backgroundColor: '#005A9C',
//     borderRadius: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     marginVertical: 8,
//   },
//   dateSectionText: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
//   loaderWrapper: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.9)',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     alignItems: 'center',
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   modalButton: {
//     backgroundColor: COLORS.light.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 40,
//     borderRadius: 20,
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default ChatScreen;
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import { COLORS } from '../Constants/Colors';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../Context/UserContext';
import { API_URL } from '../config';
import WhatsAppLoaders from '../Components/WhatsAppLoaders';

function flattenChatsByDate(chats) {
  const groups = {};
  chats.forEach(chat => {
    const dateObj = chat.ProcessDate ? new Date(chat.ProcessDate) : null;
    if (!dateObj) return;
    const dateLabel = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(chat);
  });
  const sortedDates = Object.keys(groups).sort(
    (a, b) =>
      new Date(a.split('-').reverse().join('-')) -
      new Date(b.split('-').reverse().join('-')),
  );
  return sortedDates.flatMap(date => [
    { type: 'date', date },
    ...groups[date].map(chat => ({ type: 'message', ...chat })),
  ]);
}

const ChatScreen = ({ route }) => {
  const { number, chats: initialChats, refresh = false } = route.params;
  const [chats, setChats] = useState(
    Array.isArray(initialChats) ? initialChats : [],
  );
  const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const { user } = useContext(UserContext);

  // --- Fetch eligibility ---
  const checkEligibility = async () => {
    try {
      setLoading(true);
      const senderNo = user.WhatsAppSenderID;
      const response = await fetch(
        `${API_URL}/checkLastuserMessage?senderid=${senderNo}&clientno=${number}`,
        { method: 'POST' },
      );
      const data = await response.json();
      console.log('data chat', data);
      setCheckMessageEligibility(data.Data === 'Yes');
    } catch (error) {
      console.error('Eligibility check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch chats dynamically ---
  const fetchChats = async () => {
    setLoading(true);
    try {
      const senderId = user.WhatsAppSenderID;
      const clientId = number;
      let sinceDate = '1900-01-01T00:00:00.000';
      if (chats.length > 0) {
        // Sort to find the latest ProcessDate
        const sortedChats = [...chats].sort(
          (a, b) => new Date(b.ProcessDate) - new Date(a.ProcessDate),
        );
        const latestChat = sortedChats[0];
        sinceDate = new Date(latestChat.ProcessDate).toISOString();
      }
      const data = {
        SenderId: senderId,
        ClientId: clientId,
        Date: sinceDate,
      };
      console.log('data >>>>', data);
      const response = await fetch(
        'https://www.loadcrm.com/whatsappmobileapis/api/GetClientChat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();
      let newChats = Array.isArray(result.Data) ? result.Data : [];
      // Filter out duplicates based on id
      const existingIds = new Set(chats.map(c => c.id));
      newChats = newChats.filter(c => !existingIds.has(c.id));
      // Append new chats, dedupe again for safety, and sort by ProcessDate
      setChats(prev => {
        const allChats = [...prev, ...newChats];
        // Dedupe by id
        const uniqueChats = Array.from(
          new Map(allChats.map(chat => [chat.id, chat])).values(),
        );
        // Sort by ProcessDate ascending
        uniqueChats.sort(
          (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
        );
        return uniqueChats;
      });
    } catch (error) {
      console.error('Fetch chats failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEligibility();
    if (chats.length === 0 || refresh) {
      fetchChats();
    }
  }, [refresh]);

  // Refresh chats when screen comes into focus (e.g., returning from Templates)
  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, []),
  );

  const flatData = flattenChatsByDate(chats);

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  const handleInputPress = () => {
    if (!checkMessageEligibility) {
      setModalVisible(true);
    }
  };

  const handleModalOk = () => {
    setModalVisible(false);
    navigation.navigate('Templates', { number });
  };

  // --- Auto scroll to bottom ---
  useEffect(() => {
    if (flatListRef.current && flatData.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [flatData]);

  const handleContentSizeChange = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderWrapper}>
        <WhatsAppLoaders type="bar" color={COLORS.loader} />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionText}>{item.date}</Text>
        </View>
      );
    }

    const isAttachment = item.MessageType === 'ATTACHMENT' || item.Imagepath;
    let mediaContent = null;

    if (isAttachment && item.Imagepath) {
      const isImage =
        item.Attachement_Type === 'image' ||
        item.Imagepath.endsWith('.png') ||
        item.Imagepath.endsWith('.jpg') ||
        item.Imagepath.endsWith('.jpeg');
      if (isImage) {
        mediaContent = (
          <Image
            source={{ uri: item.Imagepath }}
            style={styles.messageImage}
            resizeMode="contain"
          />
        );
      } // Add similar for video, audio, document if needed
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.Mode === 'Send' ? styles.sent : styles.received,
        ]}
      >
        {mediaContent}
        {item.MessageText && (
          <Text style={styles.messageText}>{item.MessageText}</Text>
        )}
        {item.Attachement_Caption && (
          <Text style={styles.captionText}>{item.Attachement_Caption}</Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Text style={styles.messageTime}>
            {item.ProcessDate
              ? new Date(item.ProcessDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Text>
          {item.Mode === 'Send' && (
            <FontAwesome6
              name={item.readstatus === 'read' ? 'check-double' : 'check'}
              size={16}
              color={item.readstatus === 'read' ? COLORS.light.primary : 'gray'}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('OwnChat')}>
          <Feather name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.headerText}>{number}</Text>
        </View>
        <TouchableOpacity onPress={fetchChats} style={{ marginLeft: 'auto' }}>
          <Feather name="refresh-cw" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={flatData}
        keyExtractor={item =>
          item.type === 'date'
            ? `date-${item.date}`
            : item.id?.toString() || `${item.type}-${Math.random()}`
        }
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
        onContentSizeChange={handleContentSizeChange}
      />

      <View style={styles.inputContainerTextMessage}>
        {checkMessageEligibility ? (
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline={true}
            placeholderTextColor="#888"
          />
        ) : (
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={handleInputPress}
            activeOpacity={0.7}
          >
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              multiline={true}
              placeholderTextColor="#888"
              editable={false}
            />
          </TouchableOpacity>
        )}
        {checkMessageEligibility && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Feather
              name="send"
              size={22}
              color={message.trim() ? '#fff' : '#ccc'}
            />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              To restart chat, send any approved message from the list.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalOk}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: COLORS.light.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  messageContainer: {
    marginVertical: 6,
    maxWidth: '80%',
    borderRadius: 10,
    padding: 10,
  },
  sent: { backgroundColor: '#d1f7c4', alignSelf: 'flex-end' },
  received: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  messageText: { fontSize: 16, color: '#333' },
  messageTime: { fontSize: 12, color: '#888', alignSelf: 'flex-end' },
  inputContainerTextMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapper: { flex: 1 },
  sendButton: {
    backgroundColor: COLORS.light.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: { backgroundColor: '#f0f0f0', opacity: 0.6 },
  dateSection: {
    alignSelf: 'center',
    backgroundColor: '#005A9C',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: 8,
  },
  dateSectionText: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  captionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default ChatScreen;
