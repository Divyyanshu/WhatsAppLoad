// import React, {
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   useMemo,
//   useCallback,
// } from 'react';
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
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Keyboard,
// } from 'react-native';
// import { COLORS } from '../Constants/Colors';
// import Feather from 'react-native-vector-icons/Feather';
// import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { UserContext } from '../Context/UserContext';
// import { API_URL } from '../config';
// import Video from 'react-native-video';
// import Footer from '../Components/Footer';
// import * as ImagePicker from 'react-native-image-picker';
// import { pick, isCancel } from '@react-native-documents/picker';

// // Utility to flatten chats by date
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

//   const sortedDates = Object.keys(groups).sort((a, b) => {
//     const parseDate = str => {
//       const [d, m, y] = str.split('/').map(Number);
//       return new Date(y, m - 1, d);
//     };
//     return parseDate(a) - parseDate(b);
//   });

//   return sortedDates.flatMap(date => [
//     { type: 'date', date },
//     ...groups[date].map(chat => ({ type: 'message', ...chat })),
//   ]);
// }

// // Memoized ChatItem
// const ChatItem = React.memo(
//   ({ item }) => {
//     if (item.type === 'date')
//       return (
//         <View style={styles.dateSection}>
//           <Text style={styles.dateSectionText}>{item.date}</Text>
//         </View>
//       );

//     const isSent = item.Mode === 'Send';

//     const renderAttachment = chat => {
//       if (!chat || !chat.Imagepath) return null;
//       const uri = chat.Imagepath;
//       const type = (chat.Attachement_Type || '').toLowerCase();

//       if (type === 'image' || uri.match(/\.(jpg|jpeg|png|gif)$/i))
//         return (
//           <Image
//             source={{ uri }}
//             style={styles.mediaImage}
//             resizeMode="cover"
//           />
//         );
//       if (type === 'video' || uri.match(/\.(mp4|mov|avi)$/i))
//         return (
//           <Video source={{ uri }} style={styles.mediaVideo} controls paused />
//         );
//       if (type === 'audio' || uri.match(/\.(mp3|wav|m4a)$/i))
//         return (
//           <View style={styles.audioContainer}>
//             <Feather name="headphones" size={28} color={COLORS.light.primary} />
//             <TouchableOpacity onPress={() => Linking.openURL(uri)}>
//               <Text style={styles.audioText}>
//                 {chat.Attachement_Caption || 'Play Audio'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         );
//       if (type === 'document' || uri.match(/\.(pdf|docx|xls|xlsx)$/i))
//         return (
//           <TouchableOpacity onPress={() => Linking.openURL(uri)}>
//             <Text style={styles.documentText}>
//               {chat.Attachement_Caption || 'Open Document'}
//             </Text>
//           </TouchableOpacity>
//         );
//       return null;
//     };

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
//   },
//   (prevProps, nextProps) => prevProps.item.Uid === nextProps.item.Uid,
// );

// const ChatScreen = ({ route }) => {
//   const { number, chats: initialChats, refresh = false } = route.params;
//   const [chats, setChats] = useState(
//     Array.isArray(initialChats) ? initialChats : [],
//   );
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [isLoadingOlder, setIsLoadingOlder] = useState(false);
//   const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

//   const flatListRef = useRef(null);
//   const ws = useRef(null);
//   const receivedUids = useRef(new Set());
//   const reconnectTimeoutRef = useRef(null);
//   const prevChatsLength = useRef(0);
//   const { user } = useContext(UserContext);
//   const navigation = useNavigation();
//   const wsUrl = `wss://www.loadcrm.com/whatsappwebsocket/ws/chat?senderNumber=${user.WhatsAppSenderID}&receiverNumber=${number}&sysIpAddress=192.168.1.100&user=app`;

//   const setupWebSocket = useCallback(() => {
//     if (ws.current) {
//       ws.current.close();
//       ws.current = null;
//     }
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
//     ws.current = new WebSocket(wsUrl);

//     ws.current.onopen = () => {
//       console.log('WebSocket Connected');
//       fetchChats();
//     };
//     ws.current.onmessage = e => {
//       try {
//         const msg = JSON.parse(e.data);
//         if (
//           msg.type === 'connectionReplaced' ||
//           msg.type === 'connectionEstablished'
//         )
//           return;

//         if (msg.events_mid || msg.Mid) {
//           const confirmedMid = msg.events_mid || msg.Mid;
//           setChats(prev =>
//             prev.map(c =>
//               c.Mid === confirmedMid || c.Uid === confirmedMid
//                 ? { ...c, readstatus: 'sent', Mid: confirmedMid }
//                 : c,
//             ),
//           );
//           return;
//         }

//         if (!receivedUids.current.has(msg.Uid)) {
//           if (msg.Mode === 'Send') {
//             setChats(prev => {
//               let replaced = false;
//               const newChats = prev.map(c => {
//                 if (
//                   c.readstatus === 'pending' &&
//                   (c.Mid === msg.Mid ||
//                     c.Uid === msg.Mid ||
//                     c.MessageText === msg.MessageText)
//                 ) {
//                   replaced = true;
//                   const updatedMsg = { ...c, ...msg, readstatus: 'sent' };
//                   if (c.Uid !== msg.Uid) {
//                     receivedUids.current.delete(c.Uid);
//                     receivedUids.current.add(msg.Uid);
//                   }
//                   return updatedMsg;
//                 }
//                 return c;
//               });
//               if (!replaced) {
//                 receivedUids.current.add(msg.Uid);
//                 newChats.push(msg);
//               }
//               return newChats.sort(
//                 (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
//               );
//             });
//           } else {
//             receivedUids.current.add(msg.Uid);
//             setChats(prev =>
//               [...prev, msg].sort(
//                 (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
//               ),
//             );
//           }
//         }
//       } catch (err) {
//         console.error('WebSocket parsing error:', err);
//       }
//     };
//     ws.current.onerror = () => {
//       console.error('WebSocket connection error occurred');
//     };
//     ws.current.onclose = e => {
//       console.warn('WebSocket Closed:', e.code, e.reason);
//       if (e.code !== 1000 && !reconnectTimeoutRef.current) {
//         reconnectTimeoutRef.current = setTimeout(() => {
//           console.log('Attempting WebSocket reconnection...');
//           setupWebSocket();
//         }, 3000);
//       }
//     };
//   }, [number, user.WhatsAppSenderID]);

//   useEffect(() => {
//     setupWebSocket();
//     return () => {
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//       ws.current?.close();
//     };
//   }, [setupWebSocket]);

//   // Auto scroll to bottom on new messages
//   useEffect(() => {
//     if (chats.length > prevChatsLength.current && !isLoadingOlder) {
//       setTimeout(() => {
//         flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//       }, 100);
//     }
//     prevChatsLength.current = chats.length;
//   }, [chats, isLoadingOlder]);

//   const fetchChats = async () => {
//     setLoading(true);
//     try {
//       let sinceDate = '1900-01-01T00:00:00.000';
//       if (chats.length > 0)
//         sinceDate = new Date(
//           [...chats].sort(
//             (a, b) => new Date(b.ProcessDate) - new Date(a.ProcessDate),
//           )[0].ProcessDate,
//         ).toISOString();

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
//   const fetchOlderChats = async () => {
//     if (loading || chats.length === 0) return;
//     setIsLoadingOlder(true);
//     try {
//       // To fetch older messages, request from the beginning of time to catch all missing
//       const sinceDate = '1900-01-01T00:00:00.000';

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
//       const olderChats = Array.isArray(result.Data) ? result.Data : [];
//       const uniqueOldChats = olderChats.filter(
//         c => !receivedUids.current.has(c.Uid),
//       );
//       uniqueOldChats.forEach(c => receivedUids.current.add(c.Uid));

//       // Prepend older chats to existing ones and sort
//       setChats(prev =>
//         [...uniqueOldChats, ...prev].sort(
//           (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
//         ),
//       );
//     } catch (error) {
//       console.error('Error fetching older chats:', error);
//     } finally {
//       setIsLoadingOlder(false);
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

//   // Memoized flat data
//   const flatData = useMemo(() => flattenChatsByDate(chats), [chats]);

//   const handleSend = async () => {
//     if (!message.trim()) return;
//     setLoading(true);
//     setMessage('');

//     try {
//       const to = number;
//       const bearerToken = user.WhatsAppBearer;
//       const messageContentBlock = { type: 'text', text: message.trim() };
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
//           sender: { from: user.WhatsAppSenderID },
//           preferences: { webHookDNId: '1001' },
//         },
//         metaData: { version: 'v1.0.9' },
//       };

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
//       const mid = result?.mid;
//       if (!mid) throw new Error('MID not returned by RCM API.');

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

//       if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//         ws.current.send(JSON.stringify(payload));
//       } else {
//         setupWebSocket();
//         setTimeout(() => {
//           if (ws.current?.readyState === WebSocket.OPEN)
//             ws.current.send(JSON.stringify(payload));
//         }, 2000);
//       }

//       const saveResponse = await fetch(`${API_URL}/SaveMessage`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const saveResult = await saveResponse.json();
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
//       setMessage(message); // Restore message on error
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

//   const handleChooseGallery = () => {
//     setAttachmentModalVisible(false);
//     ImagePicker.launchImageLibrary(
//       {
//         mediaType: 'photo',
//         quality: 1,
//       },
//       response => {
//         if (response.didCancel) {
//           console.log('User cancelled gallery');
//         } else if (response.errorCode) {
//           console.log('Gallery Error: ', response.errorMessage);
//         } else {
//           const uri = response.assets[0].uri;
//           console.log('Gallery selected: ', uri);
//           // TODO: Implement send attachment logic here
//         }
//       },
//     );
//   };

//   const handleChooseVideo = () => {
//     setAttachmentModalVisible(false);
//     ImagePicker.launchImageLibrary(
//       {
//         mediaType: 'video',
//         quality: 1,
//       },
//       response => {
//         if (response.didCancel) {
//           console.log('User cancelled video');
//         } else if (response.errorCode) {
//           console.log('Video Error: ', response.errorMessage);
//         } else {
//           const uri = response.assets[0].uri;
//           console.log('Video selected: ', uri);
//           // TODO: Implement send attachment logic here
//         }
//       },
//     );
//   };

//   const handleChooseDocument = async () => {
//     setAttachmentModalVisible(false);
//     try {
//       const [res] = await pick({
//         type: [
//           'application/pdf',
//           'application/msword',
//           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         ],
//         copyTo: 'cachesDirectory',
//       });
//       console.log('Document selected: ', res.uri);
//       // TODO: Implement send attachment logic here
//     } catch (err) {
//       if (isCancel(err)) {
//         console.log('User cancelled document');
//       } else {
//         console.log('Document Picker Error: ', err);
//       }
//     }
//   };

//   const handleChooseAudio = async () => {
//     setAttachmentModalVisible(false);
//     try {
//       const [res] = await pick({
//         type: ['audio/*'],
//         copyTo: 'cachesDirectory',
//       });
//       console.log('Audio selected: ', res.uri);
//       // TODO: Implement send attachment logic here
//     } catch (err) {
//       if (isCancel(err)) {
//         console.log('User cancelled audio');
//       } else {
//         console.log('Audio Picker Error: ', err);
//       }
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View style={styles.container}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.navigate('OwnChat')}>
//               <Feather name="arrow-left" size={30} color="#fff" />
//             </TouchableOpacity>
//             <View style={styles.headerInfo}>
//               <View style={styles.avatar}>
//                 <Text style={styles.avatarText}>
//                   {String(number || '').charAt(0) || 'A'}
//                 </Text>
//               </View>
//               <Text style={styles.headerText}>{number}</Text>
//             </View>
//             <TouchableOpacity
//               onPress={fetchChats}
//               style={{ marginLeft: 'auto' }}
//             >
//               <Feather name="refresh-cw" size={28} color="#fff" />
//             </TouchableOpacity>
//           </View>

//           {loading && chats.length === 0 && (
//             <View style={styles.loaderWrapper}>
//               <ActivityIndicator size="large" color={COLORS.light.primary} />
//             </View>
//           )}

//           <FlatList
//             ref={flatListRef}
//             data={[...flatData].reverse()}
//             keyExtractor={(item, index) =>
//               item.Uid || `chat-${index}-${item.date || 'msg'}`
//             }
//             renderItem={({ item }) => <ChatItem item={item} />}
//             contentContainerStyle={{ paddingVertical: 10, paddingBottom: 20 }}
//             inverted
//             showsVerticalScrollIndicator={true}
//             bounces={Platform.OS === 'ios'}
//             initialNumToRender={30}
//             maxToRenderPerBatch={20}
//             windowSize={10}
//             removeClippedSubviews={false}
//             onEndReachedThreshold={0.2}
//             onEndReached={() => {
//               console.log('Fetching older chats...');
//               fetchOlderChats();
//             }}
//             ListHeaderComponent={
//               isLoadingOlder ? (
//                 <View style={{ padding: 10, alignItems: 'center' }}>
//                   <ActivityIndicator
//                     size="small"
//                     color={COLORS.light.primary}
//                   />
//                   <Text style={{ fontSize: 12, color: '#888', marginTop: 5 }}>
//                     Loading older messages...
//                   </Text>
//                 </View>
//               ) : null
//             }
//             ListFooterComponent={
//               loading && chats.length === 0 ? (
//                 <ActivityIndicator
//                   size="small"
//                   color={COLORS.light.primary}
//                   style={{ marginVertical: 10 }}
//                 />
//               ) : null
//             }
//           />

//           {/* Input */}
//           <View style={styles.inputContainerTextMessage}>
//             {checkMessageEligibility ? (
//               <TextInput
//                 style={styles.input}
//                 placeholder="Type a message..."
//                 value={message}
//                 onChangeText={setMessage}
//                 multiline
//                 placeholderTextColor="#888"
//                 returnKeyType="send"
//                 onFocus={() =>
//                   setTimeout(
//                     () =>
//                       flatListRef.current?.scrollToOffset({
//                         offset: 0,
//                         animated: true,
//                       }),
//                     200,
//                   )
//                 }
//                 onSubmitEditing={() => {
//                   if (Platform.OS !== 'ios') handleSend();
//                 }}
//               />
//             ) : (
//               <TouchableOpacity
//                 onPress={handleInputPress}
//                 style={styles.inputWrapper}
//               >
//                 <TextInput
//                   style={[styles.input, styles.disabledInput]}
//                   placeholder="Type a message..."
//                   editable={false}
//                   placeholderTextColor="#888"
//                 />
//               </TouchableOpacity>
//             )}
//             {checkMessageEligibility && (
//               <>
//                 <TouchableOpacity
//                   style={styles.attachButton}
//                   onPress={() => setAttachmentModalVisible(true)}
//                 >
//                   <Feather name="paperclip" size={22} color="#555" />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.sendButton}
//                   onPress={handleSend}
//                   disabled={!message.trim()}
//                 >
//                   <Feather
//                     name="send"
//                     size={22}
//                     color={message.trim() ? '#fff' : '#ccc'}
//                   />
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>

//           {/* Eligibility Modal */}
//           <Modal animationType="slide" transparent visible={modalVisible}>
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContainer}>
//                 <Text style={styles.modalText}>
//                   To restart chat, send any approved message from the list.
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.modalButton}
//                   onPress={handleModalOk}
//                 >
//                   <Text style={styles.modalButtonText}>OK</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>

//           {/* Attachment Modal */}
//           <Modal
//             animationType="slide"
//             transparent={true}
//             visible={attachmentModalVisible}
//           >
//             <View style={styles.modalOverlay}>
//               <View style={styles.attachmentModalContainer}>
//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={handleChooseGallery}
//                 >
//                   <Text style={styles.modalOptionText}>
//                     Choose from Gallery
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={handleChooseDocument}
//                 >
//                   <Text style={styles.modalOptionText}>Choose Document</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={handleChooseVideo}
//                 >
//                   <Text style={styles.modalOptionText}>Choose Video</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={handleChooseAudio}
//                 >
//                   <Text style={styles.modalOptionText}>Choose Audio</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.modalOption, styles.cancelOption]}
//                   onPress={() => setAttachmentModalVisible(false)}
//                 >
//                   <Text style={styles.modalOptionText}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// };

// // Styles
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
//     marginVertical: 4,
//     marginHorizontal: 12,
//     maxWidth: '80%',
//     borderRadius: 18,
//     padding: 12,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.22,
//     shadowRadius: 2.22,
//     elevation: 3,
//   },
//   sent: {
//     backgroundColor: '#d1f7c4',
//     alignSelf: 'flex-end',
//     shadowOpacity: 0.1,
//   },
//   received: {
//     backgroundColor: '#fff',
//     alignSelf: 'flex-start',
//   },
//   messageText: { fontSize: 16, color: '#333', lineHeight: 20 },
//   captionText: { fontSize: 14, color: '#666', marginTop: 5 },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//   },
//   messageTime: { fontSize: 12, color: '#888' },
//   inputContainerTextMessage: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: 12,
//     paddingVertical: 14,
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     margin: 12,
//     marginBottom: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//   },
//   inputWrapper: { flex: 1 },
//   attachButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 8,
//   },
//   sendButton: {
//     backgroundColor: COLORS.light.primary,
//     width: 44,
//     height: 44,
//     borderRadius: 22,
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
//     textAlignVertical: 'center',
//   },
//   disabledInput: { backgroundColor: '#f0f0f0', opacity: 0.6 },
//   dateSection: {
//     alignSelf: 'center',
//     backgroundColor: '#e0e0e0',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     marginVertical: 12,
//   },
//   dateSectionText: { fontSize: 13, color: '#666', fontWeight: '600' },
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
//     lineHeight: 22,
//   },
//   modalButton: {
//     backgroundColor: COLORS.light.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 40,
//     borderRadius: 20,
//   },
//   modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   attachmentModalContainer: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     alignItems: 'center',
//     width: '100%',
//   },
//   modalOption: {
//     paddingVertical: 15,
//     width: '100%',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   cancelOption: {
//     borderBottomWidth: 0,
//     marginTop: 10,
//   },
//   modalOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   mediaImage: {
//     width: 200,
//     height: 200,
//     borderRadius: 12,
//     marginBottom: 5,
//     alignSelf: 'flex-start',
//   },
//   mediaVideo: {
//     width: 200,
//     height: 200,
//     borderRadius: 12,
//     marginBottom: 5,
//     alignSelf: 'flex-start',
//   },
//   audioContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   audioText: {
//     color: COLORS.light.primary,
//     marginLeft: 8,
//     fontSize: 16,
//     textDecorationLine: 'underline',
//   },
//   documentText: {
//     color: COLORS.light.primary,
//     textDecorationLine: 'underline',
//   },
// });

// export default ChatScreen;
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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from 'react-native';
import { COLORS } from '../Constants/Colors';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../Context/UserContext';
import { API_URL } from '../config';
import Video from 'react-native-video';
import Footer from '../Components/Footer';
import * as ImagePicker from 'react-native-image-picker';
import { pick, isCancel } from '@react-native-documents/picker';

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

  const sortedDates = Object.keys(groups).sort((a, b) => {
    const parseDate = str => {
      const [d, m, y] = str.split('/').map(Number);
      return new Date(y, m - 1, d);
    };
    return parseDate(a) - parseDate(b);
  });

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

// Utility to close WebSocket with a promise
const closeWebSocket = (wsRef, reconnectTimeoutRef) => {
  return new Promise(resolve => {
    if (wsRef.current) {
      wsRef.current.onclose = () => {
        console.log('WebSocket closed successfully');
        wsRef.current = null;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        resolve();
      };
      wsRef.current.onerror = () => {
        console.error('WebSocket error during closure');
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

const ChatScreen = ({ route }) => {
  const { number, chats: initialChats, refresh = false } = route.params;
  const [chats, setChats] = useState(
    Array.isArray(initialChats) ? initialChats : [],
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

  const flatListRef = useRef(null);
  const ws = useRef(null);
  const receivedUids = useRef(new Set());
  const reconnectTimeoutRef = useRef(null);
  const prevChatsLength = useRef(0);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const wsUrl = `wss://www.loadcrm.com/whatsappwebsocket/ws/chat?senderNumber=${user.WhatsAppSenderID}&receiverNumber=${number}&sysIpAddress=192.168.1.100&user=app`;

  const setupWebSocket = useCallback(() => {
    // Close existing WebSocket before setting up a new one
    closeWebSocket(ws, reconnectTimeoutRef).then(() => {
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
      ws.current.onerror = () => {
        console.error('WebSocket connection error occurred');
      };
      ws.current.onclose = e => {
        console.warn('WebSocket Closed:', e.code, e.reason);
        if (e.code !== 1000 && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting WebSocket reconnection...');
            setupWebSocket();
          }, 3000);
        }
      };
    });
  }, [number, user.WhatsAppSenderID]);

  useEffect(() => {
    setupWebSocket();
    return () => {
      // Cleanup on component unmount
      closeWebSocket(ws, reconnectTimeoutRef);
    };
  }, [setupWebSocket]);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeWebSocket(ws, reconnectTimeoutRef).then(() => {
          navigation.navigate('OwnChat');
        });
        return true; // Prevent default back behavior
      },
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (chats.length > prevChatsLength.current && !isLoadingOlder) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
    prevChatsLength.current = chats.length;
  }, [chats, isLoadingOlder]);

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

  const fetchOlderChats = async () => {
    if (loading || chats.length === 0) return;
    setIsLoadingOlder(true);
    try {
      const sinceDate = '1900-01-01T00:00:00.000';

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
      const olderChats = Array.isArray(result.Data) ? result.Data : [];
      const uniqueOldChats = olderChats.filter(
        c => !receivedUids.current.has(c.Uid),
      );
      uniqueOldChats.forEach(c => receivedUids.current.add(c.Uid));

      setChats(prev =>
        [...uniqueOldChats, ...prev].sort(
          (a, b) => new Date(a.ProcessDate) - new Date(b.ProcessDate),
        ),
      );
    } catch (error) {
      console.error('Error fetching older chats:', error);
    } finally {
      setIsLoadingOlder(false);
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
      setMessage(message); // Restore message on error
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

  const handleChooseGallery = () => {
    setAttachmentModalVisible(false);
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.errorCode) {
          console.log('Gallery Error: ', response.errorMessage);
        } else {
          const uri = response.assets[0].uri;
          console.log('Gallery selected: ', uri);
          // TODO: Implement send attachment logic here
        }
      },
    );
  };

  const handleChooseVideo = () => {
    setAttachmentModalVisible(false);
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'video',
        quality: 1,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled video');
        } else if (response.errorCode) {
          console.log('Video Error: ', response.errorMessage);
        } else {
          const uri = response.assets[0].uri;
          console.log('Video selected: ', uri);
          // TODO: Implement send attachment logic here
        }
      },
    );
  };

  const handleChooseDocument = async () => {
    setAttachmentModalVisible(false);
    try {
      const [res] = await pick({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyTo: 'cachesDirectory',
      });
      console.log('Document selected: ', res.uri);
      // TODO: Implement send attachment logic here
    } catch (err) {
      if (isCancel(err)) {
        console.log('User cancelled document');
      } else {
        console.log('Document Picker Error: ', err);
      }
    }
  };

  const handleChooseAudio = async () => {
    setAttachmentModalVisible(false);
    try {
      const [res] = await pick({
        type: ['audio/*'],
        copyTo: 'cachesDirectory',
      });
      console.log('Audio selected: ', res.uri);
      // TODO: Implement send attachment logic here
    } catch (err) {
      if (isCancel(err)) {
        console.log('User cancelled audio');
      } else {
        console.log('Audio Picker Error: ', err);
      }
    }
  };

  // Memoized flat data
  const flatData = useMemo(() => flattenChatsByDate(chats), [chats]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                closeWebSocket(ws, reconnectTimeoutRef).then(() => {
                  navigation.navigate('OwnChat');
                });
              }}
            >
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
            <TouchableOpacity
              onPress={() => {
                closeWebSocket(ws, reconnectTimeoutRef).then(() => {
                  setupWebSocket();
                });
              }}
              style={{ marginLeft: 'auto' }}
            >
              <Feather name="refresh-cw" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {loading && chats.length === 0 && (
            <View style={styles.loaderWrapper}>
              <ActivityIndicator size="large" color={COLORS.light.primary} />
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={[...flatData].reverse()}
            keyExtractor={(item, index) =>
              item.Uid || `chat-${index}-${item.date || 'msg'}`
            }
            renderItem={({ item }) => <ChatItem item={item} />}
            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 20 }}
            inverted
            showsVerticalScrollIndicator={true}
            bounces={Platform.OS === 'ios'}
            initialNumToRender={30}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews={false}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              console.log('Fetching older chats...');
              fetchOlderChats();
            }}
            ListHeaderComponent={
              isLoadingOlder ? (
                <View style={{ padding: 10, alignItems: 'center' }}>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.light.primary}
                  />
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 5 }}>
                    Loading older messages...
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              loading && chats.length === 0 ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.light.primary}
                  style={{ marginVertical: 10 }}
                />
              ) : null
            }
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
                onFocus={() =>
                  setTimeout(
                    () =>
                      flatListRef.current?.scrollToOffset({
                        offset: 0,
                        animated: true,
                      }),
                    200,
                  )
                }
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
              <>
                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={() => setAttachmentModalVisible(true)}
                >
                  <Feather name="paperclip" size={22} color="#555" />
                </TouchableOpacity>
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
              </>
            )}
          </View>

          {/* Eligibility Modal */}
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

          {/* Attachment Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={attachmentModalVisible}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.attachmentModalContainer}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleChooseGallery}
                >
                  <Text style={styles.modalOptionText}>
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleChooseDocument}
                >
                  <Text style={styles.modalOptionText}>Choose Document</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleChooseVideo}
                >
                  <Text style={styles.modalOptionText}>Choose Video</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleChooseAudio}
                >
                  <Text style={styles.modalOptionText}>Choose Audio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalOption, styles.cancelOption]}
                  onPress={() => setAttachmentModalVisible(false)}
                >
                  <Text style={styles.modalOptionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sent: {
    backgroundColor: '#d1f7c4',
    alignSelf: 'flex-end',
    shadowOpacity: 0.1,
  },
  received: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: { fontSize: 16, color: '#333', lineHeight: 20 },
  captionText: { fontSize: 14, color: '#666', marginTop: 5 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: { fontSize: 12, color: '#888' },
  inputContainerTextMessage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 25,
    margin: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  inputWrapper: { flex: 1 },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
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
    textAlignVertical: 'center',
  },
  disabledInput: { backgroundColor: '#f0f0f0', opacity: 0.6 },
  dateSection: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 12,
  },
  dateSectionText: { fontSize: 13, color: '#666', fontWeight: '600' },
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
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: COLORS.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  attachmentModalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  modalOption: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  mediaVideo: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  audioText: {
    color: COLORS.light.primary,
    marginLeft: 8,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  documentText: {
    color: COLORS.light.primary,
    textDecorationLine: 'underline',
  },
});

export default ChatScreen;
