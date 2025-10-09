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
  Linking,
} from 'react-native';
import { COLORS } from '../Constants/Colors';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../Context/UserContext';
import { API_URL } from '../config';
import WhatsAppLoaders from '../Components/WhatsAppLoaders';
import Video from 'react-native-video';

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

  // ✅ Check message eligibility
  const checkEligibility = async () => {
    try {
      setLoading(true);
      const senderNo = user.WhatsAppSenderID;
      const response = await fetch(
        `${API_URL}/checkLastuserMessage?senderid=${senderNo}&clientno=${number}`,
        { method: 'POST' },
      );
      const data = await response.json();
      setCheckMessageEligibility(data.Data === 'Yes');
    } catch (error) {
      console.error('Eligibility check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch chats dynamically
  const fetchChats = async () => {
    setLoading(true);
    try {
      const senderId = user.WhatsAppSenderID;
      const clientId = number;
      let sinceDate = '1900-01-01T00:00:00.000';
      if (chats.length > 0) {
        const sortedChats = [...chats].sort(
          (a, b) => new Date(b.ProcessDate) - new Date(a.ProcessDate),
        );
        sinceDate = new Date(sortedChats[0].ProcessDate).toISOString();
      }

      const response = await fetch(
        'https://www.loadcrm.com/whatsappmobileapis/api/GetClientChat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            SenderId: senderId,
            ClientId: clientId,
            Date: sinceDate,
          }),
        },
      );

      const result = await response.json();
      let newChats = Array.isArray(result.Data) ? result.Data : [];

      const existingIds = new Set(chats.map(c => c.id));
      newChats = newChats.filter(c => !existingIds.has(c.id));

      setChats(prev => {
        const merged = [...prev, ...newChats];
        const unique = Array.from(new Map(merged.map(c => [c.id, c])).values());
        unique.sort(
          (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
        );
        return unique;
      });
    } catch (error) {
      console.error('Fetch chats failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEligibility();
    if (chats.length === 0 || refresh) fetchChats();
  }, [refresh]);

  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, []),
  );

  const flatData = flattenChatsByDate(chats);

  const handleSend = () => {
    if (message.trim()) {
      // Future send API call can be added here
      setMessage('');
    }
  };

  const handleInputPress = () => {
    if (!checkMessageEligibility) setModalVisible(true);
  };

  const handleModalOk = () => {
    setModalVisible(false);
    navigation.replace('Templates', { number });
  };

  // ✅ Auto scroll
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(scrollToBottom, [flatData]);

  if (loading) {
    return (
      <View style={styles.loaderWrapper}>
        <WhatsAppLoaders type="bar" color={COLORS.loader} />
      </View>
    );
  }

  const renderAttachment = chat => {
    if (!chat || !chat.Imagepath) return null;

    const uri = chat.Imagepath;
    const type = chat.Attachement_Type?.toLowerCase() || '';

    // ✅ IMAGE
    if (type === 'image' || uri.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return (
        <Image source={{ uri }} style={styles.mediaImage} resizeMode="cover" />
      );
    }

    // ✅ VIDEO
    if (type === 'video' || uri.match(/\.(mp4|mov|avi)$/i)) {
      return (
        <Video source={{ uri }} style={styles.mediaVideo} controls paused />
      );
    }

    // ✅ AUDIO
    if (type === 'audio' || uri.match(/\.(mp3|wav|m4a)$/i)) {
      return (
        <View style={styles.audioContainer}>
          <Feather name="headphones" size={28} color={COLORS.light.primary} />
          <TouchableOpacity onPress={() => Linking.openURL(uri)}>
            <Text style={styles.audioText}>
              {chat.Attachement_Caption || 'Play Audio'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // ✅ DOCUMENT (pdf, docx, xls)
    if (type === 'document' || uri.match(/\.(pdf|docx|xls|xlsx)$/i)) {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(uri)}>
          <Text style={styles.documentText}>
            {chat.Attachement_Caption || 'Open Document'}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionText}>{item.date}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.Mode === 'Send' ? styles.sent : styles.received,
        ]}
      >
        {item.MessageType === 'ATTACHMENT' && renderAttachment(item)}

        {item.MessageText ? (
          <Text style={styles.messageText}>{item.MessageText}</Text>
        ) : null}

        {item.Attachement_Caption ? (
          <Text style={styles.captionText}>{item.Attachement_Caption}</Text>
        ) : null}

        <View style={styles.timeRow}>
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
      {/* ✅ Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('OwnChat')}>
          <Feather name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.headerText}>{number}</Text>
        </View>
        <TouchableOpacity onPress={fetchChats} style={{ marginLeft: 'auto' }}>
          <Feather name="refresh-cw" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ✅ Chat list */}
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
        onContentSizeChange={scrollToBottom}
      />

      {/* ✅ Input Section */}
      <View style={styles.inputContainerTextMessage}>
        {checkMessageEligibility ? (
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            placeholderTextColor="#888"
          />
        ) : (
          <TouchableOpacity
            onPress={handleInputPress}
            style={styles.inputWrapper}
          >
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Type a message..."
              value={message}
              editable={false}
              placeholderTextColor="#888"
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

      {/* ✅ Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
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

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: COLORS.light.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
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
  captionText: { fontSize: 14, color: '#666', marginTop: 5 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageTime: { fontSize: 12, color: '#888' },
  inputContainerTextMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    margin: 10,
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
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
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
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  mediaImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 5 },
  mediaVideo: { width: 200, height: 200, borderRadius: 10, marginBottom: 5 },
  audioContainer: { flexDirection: 'row', alignItems: 'center' },
  audioText: { color: COLORS.light.primary, marginLeft: 8, fontSize: 16 },
  documentText: {
    color: COLORS.light.primary,
    textDecorationLine: 'underline',
  },
});

export default ChatScreen;
