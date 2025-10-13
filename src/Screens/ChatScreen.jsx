// import React, { useContext, useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Image,
//   Linking,
// } from 'react-native';
// import { COLORS } from '../Constants/Colors';
// import Feather from 'react-native-vector-icons/Feather';
// import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { UserContext } from '../Context/UserContext';
// import { API_URL } from '../config';
// import WhatsAppLoaders from '../Components/WhatsAppLoaders';
// import Video from 'react-native-video';
// import Footer from '../Components/Footer';

// function flattenChatsByDate(chats) {
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

//   const sortedDates = Object.keys(groups).sort(
//     (a, b) =>
//       new Date(a.split('-').reverse().join('-')) -
//       new Date(b.split('-').reverse().join('-')),
//   );

//   return sortedDates.flatMap(date => [
//     { type: 'date', date },
//     ...groups[date].map(chat => ({ type: 'message', ...chat })),
//   ]);
// }

// const ChatScreen = ({ route }) => {
//   const { number, chats: initialChats, refresh = false } = route.params;
//   const [chats, setChats] = useState(
//     Array.isArray(initialChats) ? initialChats : [],
//   );
//   const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
//   const navigation = useNavigation();
//   const flatListRef = useRef(null);
//   const { user } = useContext(UserContext);

//   //Check message eligibility
//   const checkEligibility = async () => {
//     try {
//       setLoading(true);
//       const senderNo = user.WhatsAppSenderID;
//       const response = await fetch(
//         `${API_URL}/checkLastuserMessage?senderid=${senderNo}&clientno=${number}`,
//         { method: 'POST' },
//       );
//       const data = await response.json();
//       setCheckMessageEligibility(data.Data === 'Yes');
//     } catch (error) {
//       console.error('Eligibility check failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   //Fetch chats dynamically
//   const fetchChats = async () => {
//     setLoading(true);
//     try {
//       const senderId = user.WhatsAppSenderID;
//       const clientId = number;
//       let sinceDate = '1900-01-01T00:00:00.000';
//       if (chats.length > 0) {
//         const sortedChats = [...chats].sort(
//           (a, b) => new Date(b.ProcessDate) - new Date(a.ProcessDate),
//         );
//         sinceDate = new Date(sortedChats[0].ProcessDate).toISOString();
//       }

//       const response = await fetch(
//         'https://www.loadcrm.com/whatsappmobileapis/api/GetClientChat',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             SenderId: senderId,
//             ClientId: clientId,
//             Date: sinceDate,
//           }),
//         },
//       );

//       const result = await response.json();
//       let newChats = Array.isArray(result.Data) ? result.Data : [];

//       const existingIds = new Set(chats.map(c => c.id));
//       newChats = newChats.filter(c => !existingIds.has(c.id));

//       setChats(prev => {
//         const merged = [...prev, ...newChats];
//         const unique = Array.from(new Map(merged.map(c => [c.id, c])).values());
//         unique.sort(
//           (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
//         );
//         return unique;
//       });
//     } catch (error) {
//       console.error('Fetch chats failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     checkEligibility();
//     if (chats.length === 0 || refresh) fetchChats();
//   }, [refresh]);

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchChats();
//     }, []),
//   );

//   const flatData = flattenChatsByDate(chats);

//   const handleSend = () => {
//     if (message.trim()) {
//       // Future send API call can be added here
//       setMessage('');
//     }
//   };

//   const handleInputPress = () => {
//     if (!checkMessageEligibility) setModalVisible(true);
//   };

//   const handleModalOk = () => {
//     setModalVisible(false);
//     navigation.replace('Templates', { number });
//   };

//   //Auto scroll
//   const scrollToBottom = () => {
//     if (flatListRef.current) {
//       flatListRef.current.scrollToEnd({ animated: true });
//     }
//   };

//   useEffect(scrollToBottom, [flatData]);

//   if (loading) {
//     return (
//       <View style={styles.loaderWrapper}>
//         <WhatsAppLoaders type="bar" color={COLORS.loader} />
//       </View>
//     );
//   }

//   const renderAttachment = chat => {
//     if (!chat || !chat.Imagepath) return null;

//     const uri = chat.Imagepath;
//     const type = chat.Attachement_Type?.toLowerCase() || '';

//     //IMAGE
//     if (type === 'image' || uri.match(/\.(jpg|jpeg|png|gif)$/i)) {
//       return (
//         <Image source={{ uri }} style={styles.mediaImage} resizeMode="cover" />
//       );
//     }

//     //VIDEO
//     if (type === 'video' || uri.match(/\.(mp4|mov|avi)$/i)) {
//       return (
//         <Video source={{ uri }} style={styles.mediaVideo} controls paused />
//       );
//     }

//     //AUDIO
//     if (type === 'audio' || uri.match(/\.(mp3|wav|m4a)$/i)) {
//       return (
//         <View style={styles.audioContainer}>
//           <Feather name="headphones" size={28} color={COLORS.light.primary} />
//           <TouchableOpacity onPress={() => Linking.openURL(uri)}>
//             <Text style={styles.audioText}>
//               {chat.Attachement_Caption || 'Play Audio'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     //DOCUMENT (pdf, docx, xls)
//     if (type === 'document' || uri.match(/\.(pdf|docx|xls|xlsx)$/i)) {
//       return (
//         <TouchableOpacity onPress={() => Linking.openURL(uri)}>
//           <Text style={styles.documentText}>
//             {chat.Attachement_Caption || 'Open Document'}
//           </Text>
//         </TouchableOpacity>
//       );
//     }

//     return null;
//   };

//   const renderItem = ({ item }) => {
//     if (item.type === 'date') {
//       return (
//         <View style={styles.dateSection}>
//           <Text style={styles.dateSectionText}>{item.date}</Text>
//         </View>
//       );
//     }

//     return (
//       <View
//         style={[
//           styles.messageContainer,
//           item.Mode === 'Send' ? styles.sent : styles.received,
//         ]}
//       >
//         {item.MessageType === 'ATTACHMENT' && renderAttachment(item)}

//         {item.MessageText ? (
//           <Text style={styles.messageText}>{item.MessageText}</Text>
//         ) : null}

//         {item.Attachement_Caption ? (
//           <Text style={styles.captionText}>{item.Attachement_Caption}</Text>
//         ) : null}

//         <View style={styles.timeRow}>
//           <Text style={styles.messageTime}>
//             {item.ProcessDate
//               ? new Date(item.ProcessDate).toLocaleTimeString('en-IN', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })
//               : ''}
//           </Text>
//           {item.Mode === 'Send' && (
//             <FontAwesome6
//               name={item.readstatus === 'read' ? 'check-double' : 'check'}
//               size={16}
//               color={item.readstatus === 'read' ? COLORS.light.primary : 'gray'}
//               style={{ marginLeft: 4 }}
//             />
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/*Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.navigate('OwnChat')}>
//           <Feather name="arrow-left" size={30} color="#fff" />
//         </TouchableOpacity>
//         <View style={styles.headerInfo}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>A</Text>
//           </View>
//           <Text style={styles.headerText}>{number}</Text>
//         </View>
//         <TouchableOpacity onPress={fetchChats} style={{ marginLeft: 'auto' }}>
//           <Feather name="refresh-cw" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/*Chat list */}
//       <FlatList
//         ref={flatListRef}
//         data={flatData}
//         keyExtractor={item =>
//           item.type === 'date'
//             ? `date-${item.date}`
//             : item.id?.toString() || `${item.type}-${Math.random()}`
//         }
//         renderItem={renderItem}
//         contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
//         onContentSizeChange={scrollToBottom}
//       />

//       {/*Input Section */}
//       <View style={styles.inputContainerTextMessage}>
//         {checkMessageEligibility ? (
//           <TextInput
//             style={styles.input}
//             placeholder="Type a message..."
//             value={message}
//             onChangeText={setMessage}
//             multiline
//             placeholderTextColor="#888"
//           />
//         ) : (
//           <TouchableOpacity
//             onPress={handleInputPress}
//             style={styles.inputWrapper}
//           >
//             <TextInput
//               style={[styles.input, styles.disabledInput]}
//               placeholder="Type a message..."
//               value={message}
//               editable={false}
//               placeholderTextColor="#888"
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

//       {/*Modal */}
//       <Modal animationType="slide" transparent visible={modalVisible}>
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
//       <Footer companyName="Load Infotech" />
//     </View>
//   );
// };
// import React, { useContext, useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Image,
//   Linking,
//   ActivityIndicator,
// } from 'react-native';
// import { COLORS } from '../Constants/Colors';
// import Feather from 'react-native-vector-icons/Feather';
// import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { UserContext } from '../Context/UserContext';
// import { API_URL } from '../config';
// import Video from 'react-native-video';
// import Footer from '../Components/Footer';

// function flattenChatsByDate(chats) {
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

//   const sortedDates = Object.keys(groups).sort(
//     (a, b) =>
//       new Date(a.split('-').reverse().join('-')) -
//       new Date(b.split('-').reverse().join('-')),
//   );

//   return sortedDates.flatMap(date => [
//     { type: 'date', date },
//     ...groups[date].map(chat => ({ type: 'message', ...chat })),
//   ]);
// }

// const ChatScreen = ({ route }) => {
//   const { number, chats: initialChats, refresh = false } = route.params;
//   const [chats, setChats] = useState(
//     Array.isArray(initialChats) ? initialChats : [],
//   );
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);

//   const flatListRef = useRef(null);
//   const ws = useRef(null);
//   const receivedUids = useRef(new Set());
//   const { user } = useContext(UserContext);
//   const navigation = useNavigation();

//   const wsUrl = `wss://www.loadcrm.com/whatsappwebsocket/ws/chat?senderNumber=${user.WhatsAppSenderID}&receiverNumber=${number}&sysIpAddress=192.168.1.100&user=app`;

//   // ---------------- WebSocket Setup ---------------- //
//   const setupWebSocket = () => {
//     // Close existing connection if any
//     if (ws.current) {
//       ws.current.close();
//       ws.current = null;
//       console.log('Previous WebSocket closed');
//     }

//     ws.current = new WebSocket(wsUrl);

//     ws.current.onopen = () => {
//       console.log('WebSocket Connected');
//       fetchChats(); // Fetch missed messages on new connection
//     };

//     ws.current.onmessage = e => {
//       try {
//         const msg = JSON.parse(e.data);
//         if (
//           msg.type === 'connectionReplaced' ||
//           msg.type === 'connectionEstablished'
//         )
//           return;

//         if (!receivedUids.current.has(msg.Uid)) {
//           receivedUids.current.add(msg.Uid);
//           setChats(prev => [...prev, msg]);
//         }
//       } catch (err) {
//         console.error('WebSocket parsing error:', err);
//       }
//     };

//     ws.current.onerror = err =>
//       console.error('WebSocket Error:', err.message || err);
//     ws.current.onclose = e =>
//       console.warn('🔌 WebSocket Closed:', e.code, e.reason);
//   };

//   useEffect(() => {
//     setupWebSocket();
//     return () => ws.current?.close();
//   }, [number]); // New connection whenever chat number changes

//   // ---------------- Eligibility & Fetch ---------------- //
//   const checkEligibility = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(
//         `${API_URL}/checkLastuserMessage?senderid=${user.WhatsAppSenderID}&clientno=${number}`,
//         { method: 'POST' },
//       );
//       const data = await response.json();
//       setCheckMessageEligibility(data.Data === 'Yes');
//     } catch (error) {
//       console.error('Eligibility check failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchChats = async () => {
//     setLoading(true);
//     try {
//       let sinceDate = '1900-01-01T00:00:00.000';
//       if (chats.length > 0) {
//         const sortedChats = [...chats].sort(
//           (a, b) => new Date(b.ProcessDate) - new Date(a.ProcessDate),
//         );
//         sinceDate = new Date(sortedChats[0].ProcessDate).toISOString();
//       }

//       const response = await fetch(
//         'https://www.loadcrm.com/whatsappmobileapis/api/GetClientChat',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             SenderId: user.WhatsAppSenderID,
//             ClientId: number,
//             Date: sinceDate,
//           }),
//         },
//       );

//       const result = await response.json();
//       let newChats = Array.isArray(result.Data) ? result.Data : [];

//       newChats = newChats.filter(c => !receivedUids.current.has(c.Uid));
//       newChats.forEach(c => receivedUids.current.add(c.Uid));

//       setChats(prev =>
//         [...prev, ...newChats].sort(
//           (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
//         ),
//       );
//     } catch (error) {
//       console.error('Fetch chats failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     checkEligibility();
//     if (chats.length === 0 || refresh) fetchChats();
//   }, [refresh]);

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchChats();
//     }, []),
//   );

//   const flatData = flattenChatsByDate(chats);

//   // ---------------- Message Sending ---------------- //
//   const handleSend = () => {
//     if (!message.trim()) return;

//     const payload = {
//       Uid: `${Date.now()}-${Math.random()}`,
//       SenderID: user.WhatsAppSenderID,
//       ClientMobileno: number,
//       MessageType: 'Text',
//       MessageText: message,
//       Mode: 'Send',
//       ProcessDate: new Date().toISOString(),
//     };

//     setChats(prev => [...prev, payload]);
//     receivedUids.current.add(payload.Uid);

//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify(payload));
//       console.log('Sent via WebSocket:', payload);
//     } else console.warn('WebSocket not open:', payload);

//     setMessage('');
//   };

//   const handleInputPress = () => {
//     if (!checkMessageEligibility) setModalVisible(true);
//   };

//   const handleModalOk = () => {
//     setModalVisible(false);
//     navigation.replace('Templates', { number });
//   };

//   const scrollToBottom = () => {
//     flatListRef.current?.scrollToEnd({ animated: true });
//   };

//   useEffect(scrollToBottom, [flatData]);

//   // ---------------- Render Helpers ---------------- //
//   const renderAttachment = chat => {
//     if (!chat || !chat.Imagepath) return null;
//     const uri = chat.Imagepath;
//     const type = chat.Attachement_Type?.toLowerCase() || '';

//     if (type === 'image' || uri.match(/\.(jpg|jpeg|png|gif)$/i))
//       return <Image source={{ uri }} style={styles.mediaImage} />;

//     if (type === 'video' || uri.match(/\.(mp4|mov|avi)$/i))
//       return (
//         <Video source={{ uri }} style={styles.mediaVideo} controls paused />
//       );

//     if (type === 'audio' || uri.match(/\.(mp3|wav|m4a)$/i))
//       return (
//         <View style={styles.audioContainer}>
//           <Feather name="headphones" size={28} color={COLORS.light.primary} />
//           <TouchableOpacity onPress={() => Linking.openURL(uri)}>
//             <Text style={styles.audioText}>
//               {chat.Attachement_Caption || 'Play Audio'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       );

//     if (type === 'document' || uri.match(/\.(pdf|docx|xls|xlsx)$/i))
//       return (
//         <TouchableOpacity onPress={() => Linking.openURL(uri)}>
//           <Text style={styles.documentText}>
//             {chat.Attachement_Caption || 'Open Document'}
//           </Text>
//         </TouchableOpacity>
//       );

//     return null;
//   };

//   const renderItem = ({ item }) => {
//     if (item.type === 'date')
//       return (
//         <View style={styles.dateSection}>
//           <Text style={styles.dateSectionText}>{item.date}</Text>
//         </View>
//       );

//     return (
//       <View
//         style={[
//           styles.messageContainer,
//           item.Mode === 'Send' ? styles.sent : styles.received,
//         ]}
//       >
//         {item.MessageType === 'ATTACHMENT' && renderAttachment(item)}
//         {item.MessageText && (
//           <Text style={styles.messageText}>{item.MessageText}</Text>
//         )}
//         {item.Attachement_Caption && (
//           <Text style={styles.captionText}>{item.Attachement_Caption}</Text>
//         )}
//         <View style={styles.timeRow}>
//           <Text style={styles.messageTime}>
//             {item.ProcessDate
//               ? new Date(item.ProcessDate).toLocaleTimeString('en-IN', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })
//               : ''}
//           </Text>
//           {item.Mode === 'Send' && (
//             <FontAwesome6
//               name={item.readstatus === 'read' ? 'check-double' : 'check'}
//               size={16}
//               color={item.readstatus === 'read' ? COLORS.light.primary : 'gray'}
//               style={{ marginLeft: 4 }}
//             />
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.navigate('OwnChat')}>
//           <Feather name="arrow-left" size={30} color="#fff" />
//         </TouchableOpacity>
//         <View style={styles.headerInfo}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>A</Text>
//           </View>
//           <Text style={styles.headerText}>{number}</Text>
//         </View>
//         <TouchableOpacity onPress={fetchChats} style={{ marginLeft: 'auto' }}>
//           <Feather name="refresh-cw" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Loader */}
//       {loading && (
//         <View style={styles.loaderWrapper}>
//           <ActivityIndicator size="large" color={COLORS.light.primary} />
//         </View>
//       )}

//       {/* Chat List */}
//       <FlatList
//         ref={flatListRef}
//         data={flatData}
//         keyExtractor={item =>
//           item.type === 'date'
//             ? `date-${item.date}`
//             : item.Uid || `${item.type}-${Math.random()}`
//         }
//         renderItem={renderItem}
//         contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
//         onContentSizeChange={scrollToBottom}
//       />

//       {/* Input */}
//       <View style={styles.inputContainerTextMessage}>
//         {checkMessageEligibility ? (
//           <TextInput
//             style={styles.input}
//             placeholder="Type a message..."
//             value={message}
//             onChangeText={setMessage}
//             multiline
//             placeholderTextColor="#888"
//           />
//         ) : (
//           <TouchableOpacity
//             onPress={handleInputPress}
//             style={styles.inputWrapper}
//           >
//             <TextInput
//               style={[styles.input, styles.disabledInput]}
//               placeholder="Type a message..."
//               value={message}
//               editable={false}
//               placeholderTextColor="#888"
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
//       <Modal animationType="slide" transparent visible={modalVisible}>
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

//       {/* Footer */}
//       <Footer companyName="Load Infotech" />
//     </View>
//   );
// };

// //Styles
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   header: {
//     backgroundColor: COLORS.light.primary,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     elevation: 4,
//   },
//   headerInfo: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
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
//   sent: { backgroundColor: '#d1f7c4', alignSelf: 'flex-end' },
//   received: { backgroundColor: '#fff', alignSelf: 'flex-start' },
//   messageText: { fontSize: 16, color: '#333' },
//   captionText: { fontSize: 14, color: '#666', marginTop: 5 },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
//   messageTime: { fontSize: 12, color: '#888' },
//   inputContainerTextMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     margin: 10,
//     elevation: 2,
//   },
//   inputWrapper: { flex: 1 },
//   sendButton: {
//     backgroundColor: COLORS.light.primary,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 8,
//   },
//   input: {
//     flex: 1,
//     minHeight: 40,
//     maxHeight: 120,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     color: '#333',
//   },
//   disabledInput: { backgroundColor: '#f0f0f0', opacity: 0.6 },
//   dateSection: {
//     alignSelf: 'center',
//     backgroundColor: '#005A9C',
//     borderRadius: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     marginVertical: 8,
//   },
//   dateSectionText: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
//   loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.5)',
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
//   modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   mediaImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 5 },
//   mediaVideo: { width: 200, height: 200, borderRadius: 10, marginBottom: 5 },
//   audioContainer: { flexDirection: 'row', alignItems: 'center' },
//   audioText: { color: COLORS.light.primary, marginLeft: 8, fontSize: 16 },
//   documentText: {
//     color: COLORS.light.primary,
//     textDecorationLine: 'underline',
//   },
// });

// export default ChatScreen;
// ChatScreen.js
// import React, { useContext, useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Image,
//   Linking,
//   ActivityIndicator,
//   Platform,
//   Alert,
// } from 'react-native';
// import { COLORS } from '../Constants/Colors';
// import Feather from 'react-native-vector-icons/Feather';
// import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { UserContext } from '../Context/UserContext';
// import { API_URL } from '../config';
// import Video from 'react-native-video';
// import Footer from '../Components/Footer';

// function flattenChatsByDate(chats) {
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

//   const sortedDates = Object.keys(groups).sort(
//     (a, b) =>
//       new Date(a.split('-').reverse().join('-')) -
//       new Date(b.split('-').reverse().join('-')),
//   );

//   return sortedDates.flatMap(date => [
//     { type: 'date', date },
//     ...groups[date].map(chat => ({ type: 'message', ...chat })),
//   ]);
// }

// const ChatScreen = ({ route }) => {
//   const { number, chats: initialChats, refresh = false } = route.params;
//   const [chats, setChats] = useState(
//     Array.isArray(initialChats) ? initialChats : [],
//   );
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);

//   const flatListRef = useRef(null);
//   const ws = useRef(null);
//   const receivedUids = useRef(new Set());
//   const { user } = useContext(UserContext);
//   const navigation = useNavigation();
//   const wsUrl = `wss://www.loadcrm.com/whatsappwebsocket/ws/chat?senderNumber=${user.WhatsAppSenderID}&receiverNumber=${number}&sysIpAddress=192.168.1.100&user=app`;

//   const setupWebSocket = () => {
//     try {
//       if (ws.current) {
//         ws.current.close();
//         ws.current = null;
//         console.log('🔌 Previous WebSocket closed');
//       }

//       ws.current = new WebSocket(wsUrl);

//       ws.current.onopen = () => {
//         console.log('WebSocket Connected');
//         fetchChats();
//       };

//       ws.current.onmessage = e => {
//         try {
//           const msg = JSON.parse(e.data);
//           if (
//             msg.type === 'connectionReplaced' ||
//             msg.type === 'connectionEstablished'
//           )
//             return;

//           if (msg.events_mid || msg.Mid) {
//             const confirmedMid = msg.events_mid || msg.Mid;
//             setChats(prev =>
//               prev.map(c =>
//                 c.Mid === confirmedMid || c.Uid === confirmedMid
//                   ? { ...c, readstatus: 'sent', Mid: confirmedMid }
//                   : c,
//               ),
//             );
//             return;
//           }
//           if (!receivedUids.current.has(msg.Uid)) {
//             if (msg.Mode === 'Send') {
//               setChats(prev => {
//                 let replaced = false;
//                 const newChats = prev.map(c => {
//                   if (
//                     c.readstatus === 'pending' &&
//                     (c.Mid === msg.Mid ||
//                       c.Uid === msg.Mid ||
//                       c.MessageText === msg.MessageText)
//                   ) {
//                     replaced = true;
//                     const updatedMsg = { ...c, ...msg, readstatus: 'sent' };
//                     if (c.Uid !== msg.Uid) {
//                       receivedUids.current.delete(c.Uid);
//                       receivedUids.current.add(msg.Uid);
//                     }
//                     return updatedMsg;
//                   }
//                   return c;
//                 });

//                 if (!replaced) {
//                   receivedUids.current.add(msg.Uid);
//                   newChats.push(msg);
//                 }
//                 return newChats.sort(
//                   (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
//                 );
//               });
//             } else {
//               receivedUids.current.add(msg.Uid);
//               setChats(prev =>
//                 [...prev, msg].sort(
//                   (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
//                 ),
//               );
//             }
//           }
//         } catch (err) {
//           console.error('WebSocket parsing error:', err);
//         }
//       };

//       ws.current.onerror = err =>
//         console.error('WebSocket Error:', err?.message || err);
//       ws.current.onclose = e =>
//         console.warn('🔌 WebSocket Closed:', e?.code, e?.reason);
//     } catch (err) {
//       console.error('WebSocket setup failed:', err);
//     }
//   };

//   useEffect(() => {
//     setupWebSocket();
//     return () => ws.current?.close();
//   }, [number]);

//   const fetchChats = async () => {
//     setLoading(true);
//     try {
//       let sinceDate = '1900-01-01T00:00:00.000';
//       if (chats.length > 0) {
//         const sortedChats = [...chats].sort(
//           (a, b) => new Date(b.ProcessDate) - new Date(a.ProcessDate),
//         );
//         sinceDate = new Date(sortedChats[0].ProcessDate).toISOString();
//       }

//       const response = await fetch(
//         'https://www.loadcrm.com/whatsappmobileapis/api/GetClientChat',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             SenderId: user.WhatsAppSenderID,
//             ClientId: number,
//             Date: sinceDate,
//           }),
//         },
//       );

//       const result = await response.json();
//       let newChats = Array.isArray(result.Data) ? result.Data : [];
//       newChats = newChats.filter(c => !receivedUids.current.has(c.Uid));
//       newChats.forEach(c => receivedUids.current.add(c.Uid));

//       setChats(prev =>
//         [...prev, ...newChats].sort(
//           (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
//         ),
//       );
//     } catch (error) {
//       console.error('Fetch chats failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkEligibility = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(
//         `${API_URL}/checkLastuserMessage?senderid=${user.WhatsAppSenderID}&clientno=${number}`,
//         { method: 'POST' },
//       );
//       const data = await response.json();
//       setCheckMessageEligibility(data.Data === 'Yes');
//     } catch (error) {
//       console.error('Eligibility check failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     checkEligibility();
//     if (chats.length === 0 || refresh) fetchChats();
//   }, [refresh]);

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchChats();
//     }, []),
//   );

//   const flatData = flattenChatsByDate(chats);

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       flatListRef.current?.scrollToEnd({ animated: true });
//     }, 100);
//   };

//   useEffect(scrollToBottom, [flatData]);

//   const handleSend = async () => {
//     if (!message.trim()) return;
//     setLoading(true);
//     setMessage('');

//     try {
//       const to = number;
//       const bearerToken = user.WhatsAppBearer;
//       const messageContentBlock = {
//         type: 'text',
//         text: message.trim(),
//       };

//       const payloadForMid = {
//         message: {
//           channel: 'WABA',
//           content: messageContentBlock,
//           recipient: {
//             to,
//             recipient_type: 'individual',
//             reference: {
//               cust_ref: 'CustomerRef',
//               messageTag1: 'Tag1',
//               conversationId: 'ConvID',
//             },
//           },
//           sender: {
//             from: user.WhatsAppSenderID,
//           },
//           preferences: {
//             webHookDNId: '1001',
//           },
//         },
//         metaData: {
//           version: 'v1.0.9',
//         },
//       };

//       console.log('Sending for MID:', JSON.stringify(payloadForMid, null, 2));
//       const sendRes = await fetch(
//         'https://rcmapi.instaalerts.zone/services/rcm/sendMessage',
//         {
//           method: 'POST',
//           headers: {
//             Authentication: `Bearer ${bearerToken}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payloadForMid),
//         },
//       );

//       if (!sendRes.ok)
//         throw new Error(`Send message failed: ${sendRes.status}`);

//       const result = await sendRes.json();
//       console.log('RCM API result:', result);

//       const mid = result?.mid;
//       if (!mid) throw new Error('MID not returned by RCM API.');

//       console.log('MID Received:', mid);

//       const payload = {
//         attachment_caption: '',
//         Mid: mid,
//         HeaderText: '',
//         ListButtonName: '',
//         MessageText: message.trim(),
//         SenderID: user.WhatsAppSenderID,
//         ClientMobileNo: number,
//         attachment_type: '',
//         ServiceType: 'AUTO',
//         FooterText: '',
//         ButtonJsonList: '',
//         attachment_mimeType: '',
//         ImagePath: '',
//         WhatsAppDealerProfileID: user.WhatsAppDealerProfileID || '',
//         FileData: '',
//         MessageType: 'TEXT',
//         ButtonTemplateType: '',
//       };
//       const tempMsg = {
//         ...payload,
//         Uid: mid,
//         Mode: 'Send',
//         ProcessDate: new Date().toISOString(),
//         readstatus: 'pending',
//       };

//       setChats(prev => [...prev, tempMsg]);
//       receivedUids.current.add(tempMsg.Uid);
//       setMessage('');
//       scrollToBottom();

//       // Step 4: Send via WebSocket
//       if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//         ws.current.send(JSON.stringify(payload));
//         console.log('Sent via WebSocket with MID:', mid);
//       } else {
//         setupWebSocket();
//         setTimeout(() => {
//           if (ws.current?.readyState === WebSocket.OPEN) {
//             ws.current.send(JSON.stringify(payload));
//             console.log('Retried send after reconnect');
//           } else {
//             console.warn('Still not open after retry.');
//           }
//         }, 2000);
//       }

//       const saveResponse = await fetch(`${API_URL}/SaveMessage`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const saveResult = await saveResponse.json();
//       console.log('Message saved via API:', saveResult);

//       if (saveResult?.Data?.events_mid || saveResult?.Data?.Mid) {
//         setChats(prev =>
//           prev.map(c =>
//             c.Mid === mid || c.Uid === mid ? { ...c, readstatus: 'sent' } : c,
//           ),
//         );
//       }
//     } catch (err) {
//       console.error('handleSend failed:', err);
//       Alert.alert(
//         'Error',
//         err.message || 'Something went wrong while sending.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputPress = () => {
//     if (!checkMessageEligibility) setModalVisible(true);
//   };

//   const handleModalOk = () => {
//     setModalVisible(false);
//     navigation.replace('Templates', { number });
//   };

//   const renderAttachment = chat => {
//     if (!chat || !chat.Imagepath) return null;
//     const uri = chat.Imagepath;
//     const type = (chat.Attachement_Type || '').toLowerCase();

//     if (type === 'image' || uri.match(/\.(jpg|jpeg|png|gif)$/i))
//       return (
//         <Image source={{ uri }} style={styles.mediaImage} resizeMode="cover" />
//       );

//     if (type === 'video' || uri.match(/\.(mp4|mov|avi)$/i))
//       return (
//         <Video source={{ uri }} style={styles.mediaVideo} controls paused />
//       );

//     if (type === 'audio' || uri.match(/\.(mp3|wav|m4a)$/i))
//       return (
//         <View style={styles.audioContainer}>
//           <Feather name="headphones" size={28} color={COLORS.light.primary} />
//           <TouchableOpacity onPress={() => Linking.openURL(uri)}>
//             <Text style={styles.audioText}>
//               {chat.Attachement_Caption || 'Play Audio'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       );

//     if (type === 'document' || uri.match(/\.(pdf|docx|xls|xlsx)$/i))
//       return (
//         <TouchableOpacity onPress={() => Linking.openURL(uri)}>
//           <Text style={styles.documentText}>
//             {chat.Attachement_Caption || 'Open Document'}
//           </Text>
//         </TouchableOpacity>
//       );

//     return null;
//   };

//   const renderItem = ({ item }) => {
//     if (item.type === 'date')
//       return (
//         <View style={styles.dateSection}>
//           <Text style={styles.dateSectionText}>{item.date}</Text>
//         </View>
//       );

//     const isSent = item.Mode === 'Send';
//     return (
//       <View
//         style={[
//           styles.messageContainer,
//           isSent ? styles.sent : styles.received,
//         ]}
//       >
//         {item.MessageType === 'ATTACHMENT' && renderAttachment(item)}
//         {item.MessageText && (
//           <Text style={styles.messageText}>{item.MessageText}</Text>
//         )}
//         {item.Attachement_Caption && (
//           <Text style={styles.captionText}>{item.Attachement_Caption}</Text>
//         )}
//         <View style={styles.timeRow}>
//           <Text style={styles.messageTime}>
//             {item.ProcessDate
//               ? new Date(item.ProcessDate).toLocaleTimeString('en-IN', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })
//               : ''}
//           </Text>
//           {isSent && (
//             <FontAwesome6
//               name={item.readstatus === 'sent' ? 'check-double' : 'check'}
//               size={16}
//               color={item.readstatus === 'sent' ? COLORS.light.primary : 'gray'}
//               style={{ marginLeft: 6 }}
//             />
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.navigate('OwnChat')}>
//           <Feather name="arrow-left" size={30} color="#fff" />
//         </TouchableOpacity>
//         <View style={styles.headerInfo}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>
//               {String(number || '').charAt(0) || 'A'}
//             </Text>
//           </View>
//           <Text style={styles.headerText}>{number}</Text>
//         </View>
//         <TouchableOpacity onPress={fetchChats} style={{ marginLeft: 'auto' }}>
//           <Feather name="refresh-cw" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Loader */}
//       {loading && (
//         <View style={styles.loaderWrapper}>
//           <ActivityIndicator size="large" color={COLORS.light.primary} />
//         </View>
//       )}

//       {/* Chat list */}
//       <FlatList
//         ref={flatListRef}
//         data={flatData}
//         keyExtractor={item =>
//           item.type === 'date'
//             ? `date-${item.date}`
//             : item.Uid || `${item.type}-${Math.random()}`
//         }
//         renderItem={renderItem}
//         contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
//         onContentSizeChange={scrollToBottom}
//       />

//       {/* Input */}
//       <View style={styles.inputContainerTextMessage}>
//         {checkMessageEligibility ? (
//           <TextInput
//             style={styles.input}
//             placeholder="Type a message..."
//             value={message}
//             onChangeText={setMessage}
//             multiline
//             placeholderTextColor="#888"
//             returnKeyType="send"
//             onSubmitEditing={() => {
//               if (Platform.OS !== 'ios') handleSend();
//             }}
//           />
//         ) : (
//           <TouchableOpacity
//             onPress={handleInputPress}
//             style={styles.inputWrapper}
//           >
//             <TextInput
//               style={[styles.input, styles.disabledInput]}
//               placeholder="Type a message..."
//               editable={false}
//               placeholderTextColor="#888"
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
//       <Modal animationType="slide" transparent visible={modalVisible}>
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

//       <Footer companyName="Load Infotech" />
//     </View>
//   );
// };
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
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
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { COLORS } from '../Constants/Colors';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../Context/UserContext';
import { API_URL } from '../config';
import Video from 'react-native-video';
import Footer from '../Components/Footer';

// Utility to flatten chats by date
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

// Memoized ChatItem
const ChatItem = React.memo(
  ({ item }) => {
    if (item.type === 'date')
      return (
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionText}>{item.date}</Text>
        </View>
      );

    const isSent = item.Mode === 'Send';

    const renderAttachment = chat => {
      if (!chat || !chat.Imagepath) return null;
      const uri = chat.Imagepath;
      const type = (chat.Attachement_Type || '').toLowerCase();

      if (type === 'image' || uri.match(/\.(jpg|jpeg|png|gif)$/i))
        return (
          <Image
            source={{ uri }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        );
      if (type === 'video' || uri.match(/\.(mp4|mov|avi)$/i))
        return (
          <Video source={{ uri }} style={styles.mediaVideo} controls paused />
        );
      if (type === 'audio' || uri.match(/\.(mp3|wav|m4a)$/i))
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
      if (type === 'document' || uri.match(/\.(pdf|docx|xls|xlsx)$/i))
        return (
          <TouchableOpacity onPress={() => Linking.openURL(uri)}>
            <Text style={styles.documentText}>
              {chat.Attachement_Caption || 'Open Document'}
            </Text>
          </TouchableOpacity>
        );
      return null;
    };

    return (
      <View
        style={[
          styles.messageContainer,
          isSent ? styles.sent : styles.received,
        ]}
      >
        {item.MessageType === 'ATTACHMENT' && renderAttachment(item)}
        {item.MessageText && (
          <Text style={styles.messageText}>{item.MessageText}</Text>
        )}
        {item.Attachement_Caption && (
          <Text style={styles.captionText}>{item.Attachement_Caption}</Text>
        )}
        <View style={styles.timeRow}>
          <Text style={styles.messageTime}>
            {item.ProcessDate
              ? new Date(item.ProcessDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Text>
          {isSent && (
            <FontAwesome6
              name={item.readstatus === 'sent' ? 'check-double' : 'check'}
              size={16}
              color={item.readstatus === 'sent' ? COLORS.light.primary : 'gray'}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => prevProps.item.Uid === nextProps.item.Uid,
);

const ChatScreen = ({ route }) => {
  const { number, chats: initialChats, refresh = false } = route.params;
  const [chats, setChats] = useState(
    Array.isArray(initialChats) ? initialChats : [],
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const flatListRef = useRef(null);
  const ws = useRef(null);
  const receivedUids = useRef(new Set());
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const wsUrl = `wss://www.loadcrm.com/whatsappwebsocket/ws/chat?senderNumber=${user.WhatsAppSenderID}&receiverNumber=${number}&sysIpAddress=192.168.1.100&user=app`;

  const setupWebSocket = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      fetchChats();
    };
    ws.current.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        if (
          msg.type === 'connectionReplaced' ||
          msg.type === 'connectionEstablished'
        )
          return;

        if (msg.events_mid || msg.Mid) {
          const confirmedMid = msg.events_mid || msg.Mid;
          setChats(prev =>
            prev.map(c =>
              c.Mid === confirmedMid || c.Uid === confirmedMid
                ? { ...c, readstatus: 'sent', Mid: confirmedMid }
                : c,
            ),
          );
          return;
        }

        if (!receivedUids.current.has(msg.Uid)) {
          if (msg.Mode === 'Send') {
            setChats(prev => {
              let replaced = false;
              const newChats = prev.map(c => {
                if (
                  c.readstatus === 'pending' &&
                  (c.Mid === msg.Mid ||
                    c.Uid === msg.Mid ||
                    c.MessageText === msg.MessageText)
                ) {
                  replaced = true;
                  const updatedMsg = { ...c, ...msg, readstatus: 'sent' };
                  if (c.Uid !== msg.Uid) {
                    receivedUids.current.delete(c.Uid);
                    receivedUids.current.add(msg.Uid);
                  }
                  return updatedMsg;
                }
                return c;
              });
              if (!replaced) {
                receivedUids.current.add(msg.Uid);
                newChats.push(msg);
              }
              return newChats.sort(
                (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
              );
            });
          } else {
            receivedUids.current.add(msg.Uid);
            setChats(prev =>
              [...prev, msg].sort(
                (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
              ),
            );
          }
        }
      } catch (err) {
        console.error('WebSocket parsing error:', err);
      }
    };
    ws.current.onerror = err =>
      console.error('WebSocket Error:', err?.message || err);
    ws.current.onclose = e =>
      console.warn('WebSocket Closed:', e?.code, e?.reason);
  };

  useEffect(() => {
    setupWebSocket();
    return () => ws.current?.close();
  }, [number]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      let sinceDate = '1900-01-01T00:00:00.000';
      if (chats.length > 0)
        sinceDate = new Date(
          [...chats].sort(
            (a, b) => new Date(b.ProcessDate) - new Date(a.ProcessDate),
          )[0].ProcessDate,
        ).toISOString();

      const response = await fetch(
        'https://www.loadcrm.com/whatsappmobileapis/api/GetClientChat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            SenderId: user.WhatsAppSenderID,
            ClientId: number,
            Date: sinceDate,
          }),
        },
      );

      const result = await response.json();
      let newChats = Array.isArray(result.Data) ? result.Data : [];
      newChats = newChats.filter(c => !receivedUids.current.has(c.Uid));
      newChats.forEach(c => receivedUids.current.add(c.Uid));

      setChats(prev =>
        [...prev, ...newChats].sort(
          (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
        ),
      );
    } catch (error) {
      console.error('Fetch chats failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/checkLastuserMessage?senderid=${user.WhatsAppSenderID}&clientno=${number}`,
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

  useEffect(() => {
    checkEligibility();
    if (chats.length === 0 || refresh) fetchChats();
  }, [refresh]);

  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, []),
  );

  // Memoized flat data
  const flatData = useMemo(() => flattenChatsByDate(chats), [chats]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(scrollToBottom, [flatData.length]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setMessage('');

    try {
      const to = number;
      const bearerToken = user.WhatsAppBearer;
      const messageContentBlock = { type: 'text', text: message.trim() };
      const payloadForMid = {
        message: {
          channel: 'WABA',
          content: messageContentBlock,
          recipient: {
            to,
            recipient_type: 'individual',
            reference: {
              cust_ref: 'CustomerRef',
              messageTag1: 'Tag1',
              conversationId: 'ConvID',
            },
          },
          sender: { from: user.WhatsAppSenderID },
          preferences: { webHookDNId: '1001' },
        },
        metaData: { version: 'v1.0.9' },
      };

      const sendRes = await fetch(
        'https://rcmapi.instaalerts.zone/services/rcm/sendMessage',
        {
          method: 'POST',
          headers: {
            Authentication: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadForMid),
        },
      );

      if (!sendRes.ok)
        throw new Error(`Send message failed: ${sendRes.status}`);
      const result = await sendRes.json();
      const mid = result?.mid;
      if (!mid) throw new Error('MID not returned by RCM API.');

      const payload = {
        attachment_caption: '',
        Mid: mid,
        HeaderText: '',
        ListButtonName: '',
        MessageText: message.trim(),
        SenderID: user.WhatsAppSenderID,
        ClientMobileNo: number,
        attachment_type: '',
        ServiceType: 'AUTO',
        FooterText: '',
        ButtonJsonList: '',
        attachment_mimeType: '',
        ImagePath: '',
        WhatsAppDealerProfileID: user.WhatsAppDealerProfileID || '',
        FileData: '',
        MessageType: 'TEXT',
        ButtonTemplateType: '',
      };
      const tempMsg = {
        ...payload,
        Uid: mid,
        Mode: 'Send',
        ProcessDate: new Date().toISOString(),
        readstatus: 'pending',
      };

      setChats(prev => [...prev, tempMsg]);
      receivedUids.current.add(tempMsg.Uid);
      setMessage('');
      scrollToBottom();

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(payload));
      } else {
        setupWebSocket();
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.OPEN)
            ws.current.send(JSON.stringify(payload));
        }, 2000);
      }

      const saveResponse = await fetch(`${API_URL}/SaveMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const saveResult = await saveResponse.json();
      if (saveResult?.Data?.events_mid || saveResult?.Data?.Mid) {
        setChats(prev =>
          prev.map(c =>
            c.Mid === mid || c.Uid === mid ? { ...c, readstatus: 'sent' } : c,
          ),
        );
      }
    } catch (err) {
      console.error('handleSend failed:', err);
      Alert.alert(
        'Error',
        err.message || 'Something went wrong while sending.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputPress = () => {
    if (!checkMessageEligibility) setModalVisible(true);
  };
  const handleModalOk = () => {
    setModalVisible(false);
    navigation.replace('Templates', { number });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('OwnChat')}>
          <Feather name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {String(number || '').charAt(0) || 'A'}
            </Text>
          </View>
          <Text style={styles.headerText}>{number}</Text>
        </View>
        <TouchableOpacity onPress={fetchChats} style={{ marginLeft: 'auto' }}>
          <Feather name="refresh-cw" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color={COLORS.light.primary} />
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={flatData}
        keyExtractor={item =>
          item.type === 'date'
            ? `date-${item.date}`
            : item.Uid || `${item.type}-${Math.random()}`
        }
        renderItem={({ item }) => <ChatItem item={item} />}
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
        onContentSizeChange={scrollToBottom}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
      />

      {/* Input */}
      <View style={styles.inputContainerTextMessage}>
        {checkMessageEligibility ? (
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            placeholderTextColor="#888"
            returnKeyType="send"
            onSubmitEditing={() => {
              if (Platform.OS !== 'ios') handleSend();
            }}
          />
        ) : (
          <TouchableOpacity
            onPress={handleInputPress}
            style={styles.inputWrapper}
          >
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Type a message..."
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

      {/* Modal */}
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

      <Footer companyName="Load Infotech" />
    </View>
  );
};
// Styles
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
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 25,
    margin: 10,
    elevation: 2,
  },
  inputWrapper: { flex: 1 },
  sendButton: {
    backgroundColor: COLORS.light.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
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
