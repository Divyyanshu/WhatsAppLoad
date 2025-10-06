import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image, SectionList, TouchableOpacity, Linking } from 'react-native';
import { COLORS } from '../Constants/Colors';

import Feather from 'react-native-vector-icons/Feather'; // Using Feather icons
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'; // Using Feather icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../Context/UserContext';
import { API_URL } from '../config';
import Video from 'react-native-video';
import AuthenticatedPdfViewer from '../Components/AuthenticatedPdfViewer';


// const AttachmentView = ({ item }) => {
//     // A more robust check can be done using Attachement_MineType
//     const type = item.Attachement_Type;
//     const caption = item.Attachement_Caption || item.MessageText;

//     // Handle Image Attachments
//     if (type === 'image') {
//         return (
//             <View>
//                 {item.Imagepath && (
//                     <Image
//                         source={{ uri: item.Imagepath }}
//                         style={styles.attachmentImage}
//                         resizeMode="cover"
//                     />
//                 )}
//                 {caption ? <Text style={styles.messageText}>{caption}</Text> : null}
//             </View>
//         );
//     }

//     // Handle Document Attachments (e.g., PDF)
//     if (type === 'document') {
//         const fileName = decodeURIComponent(item.Imagepath.split('/').pop());
//         return (
//             <TouchableOpacity onPress={() => Linking.openURL(item.Imagepath)} style={styles.documentContainer}>
//                 <FontAwesome6 name="file-pdf" size={40} color="#D32F2F" />
//                 <View style={{ marginLeft: 10, flex: 1 }}>
//                     <Text style={styles.documentText} numberOfLines={2}>{fileName}</Text>
//                     {caption ? <Text style={styles.messageText}>{caption}</Text> : null}
//                 </View>
//             </TouchableOpacity>
//         );
//     }
    
//     // Handle Video Attachments
//     if (type === 'video') {
//         // NOTE: To play videos, you need a library like 'react-native-video'.
//         // The code below is a placeholder.
//         return (
//              <View>
//                 <View style={styles.videoPlaceholder}>
//                    <FontAwesome6 name="video" size={50} color="white" />
//                    <Text style={{color: 'white', marginTop: 10}}>Video File</Text>
//                 </View>
//                 {caption ? <Text style={styles.messageText}>{caption}</Text> : null}
//               </View>
//         );
//     }

//     // Fallback for any other unsupported type
//     return (
//         <View style={styles.documentContainer}>
//             <FontAwesome6 name="file-circle-question" size={40} color="gray" />
//             <Text style={[styles.documentText, {marginLeft: 10}]}>Unsupported Attachment</Text>
//         </View>
//     );
// };


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
//   const [message, setMessage] = useState('');
//   const navigation = useNavigation();
//   const sectionListRef = useRef(null);
//   const { user } = useContext(UserContext);

//   const checkEligibility = async () => {
//     try {
//       const senderNo = user.WhatsAppSenderID;
//       const response = await fetch(`${API_URL}/checkLastuserMessage?senderid=${senderNo}&clientno=${number}`, { method: 'POST' });
//       const data = await response.json();
//       if (data.Data === "Yes") {
//         setCheckMessageEligibility(true);
//       } else {
//         setCheckMessageEligibility(false);
//       }
//     } catch (error) {
//       console.error('Error fetching eligibility from API:', error);
//     }
//   };

//   useEffect(() => {
//     checkEligibility();
//   }, []);

//   useEffect(() => {
//     if (sectionListRef.current && sections.length > 0 && sections[sections.length - 1].data.length > 0) {
//       setTimeout(() => {
//         sectionListRef.current.scrollToLocation({
//           sectionIndex: sections.length - 1,
//           itemIndex: sections[sections.length - 1].data.length - 1,
//           animated: false,
//         });
//       }, 100);
//     }
//   }, [sections]);

//   const safeChats = Array.isArray(chats) ? chats : [];
//   const sections = groupChatsByDate(safeChats);

//   const handleSend = () => {
//     // Implement send logic here
//     setMessage('');
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
//         <View><Text style={styles.headerText}>{number}</Text></View>
//       </View>

//       <SectionList
//         ref={sectionListRef}
//         sections={sections}
//         keyExtractor={item => item.id}
//         renderSectionHeader={({ section: { date } }) => (
//           <View style={styles.dateSection}>
//             <Text style={styles.dateSectionText}>{date}</Text>
//           </View>
//         )}
//         renderItem={({ item }) => {
//           const isSent = item.Mode === 'Send';
//           const isAttachment = item.MessageType === 'ATTACHMENT';
//           const read = item.readstatus === "read";
//           const formattedTime = item.ProcessDate
//             ? new Date(item.ProcessDate).toLocaleTimeString('en-IN', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//               })
//             : '';
//           return (
//             <View style={[styles.messageContainer, isSent ? styles.sent : styles.received]}>
//               {isAttachment ? (
//                 <AttachmentView item={item} />
//               ) : (
//                 <Text style={styles.messageText}>{item.MessageText}</Text>
//               )}
//               <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 4 }}>
//                 <Text style={styles.messageTime}>{formattedTime}</Text>
//                 {isSent && (
//                   read ? (
//                     <FontAwesome6 name="check-double" size={16} color={COLORS.light.primary} style={{ marginLeft: 4 }} />
//                   ) : (
//                     <FontAwesome6 name="check" size={16} color='gray' style={{ marginLeft: 4 }} />
//                   )
//                 )}
//               </View>
//             </View>
//           );
//         }}
//         contentContainerStyle={{ padding: 10 }}
//         // Removed scroll logic for brevity, your existing logic is fine
//       />

//       {checkMessageEligibility ? (
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Message"
//             value={message}
//             onChangeText={setMessage}
//           />
//           <TouchableOpacity onPress={handleSend}>
//             <Feather name="send" size={24} color={COLORS.light.primary} style={{ marginLeft: 10 }} />
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.inputContainer}>
//           <TouchableOpacity
//             style={styles.templateButton}
//             onPress={() => navigation.navigate('Templates', { number })}
//           >
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Feather name="file-text" size={20} color="#000" style={{ marginRight: 8 }} />
//               <Text style={styles.templateButtonText}>See Template List</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };


function groupChatsByDate(chats) {
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
  // Return as array of {date, messages}
  return Object.keys(groups).map(date => ({
    date,
    data: groups[date],
  }));
}
const renderAttachment = (item) => {
  // Use a switch statement for clarity. It's easy to add more types later.
  // Using .toLowerCase() makes it safer in case the API sends "Image" or "IMAGE"
  switch (item.Attachement_Type?.toLowerCase()) {
    case 'image':
      return (
        <Image
          source={{ uri: item.Imagepath }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
      );

    case 'video':
      return (
        <Video
          source={{ uri: item.Imagepath }}
          style={styles.mediaVideo}
          controls={true} // Show player controls
          paused={true}   // Don't auto-play
        />
      );

    case 'document':
      // For documents, it's better UX to show a tappable placeholder
      // than to embed a whole PDF viewer in a chat bubble.
      return (
        <TouchableOpacity style={styles.documentContainer} onPress={() => { /* Add logic to open the document here */ }}>
                    <AuthenticatedPdfViewer sourceUrl={item.Imagepath} />

         </TouchableOpacity>
      );

    default:
      // If the attachment type is unknown or missing, render nothing.
      return null;
  }
};

const ChatScreen = ({ route }) => {
  const { number, chats } = route.params;
  const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
  // console.log('checkMessageEligibility', checkMessageEligibility);
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const sectionListRef = useRef(null);

  const { user, authenticated } = useContext(UserContext);
  // console.log("User from context:", user);

  // Check message eligibility  here for showing templete option or input box
  const checkEligibility = async () => {
    try {
      const senderNo = user.WhatsAppSenderID;
      // console.log('senderNo:', senderNo, number);
      const response = await fetch(`${API_URL}/checkLastuserMessage?senderid=${senderNo}&clientno=${number}`, { method: 'POST' });
      const data = await response.json();
      console.log('Eligibility response:', data);
      if (data.Data === "Yes") {
        setCheckMessageEligibility(true);
      } else {
        setCheckMessageEligibility(false);
      }
      //  setCheckMessageEligibility(data);
    } catch (error) {
      console.error('Error fetching eligibility  from API:', error);

    }
  };

  useEffect(() => {

    checkEligibility();
  }, []);

  // Scroll to bottom when chats change
  useEffect(() => {
    if (
      sectionListRef.current &&
      sections.length > 0 &&
      sections[sections.length - 1].data.length > 0
    ) {
      setTimeout(() => {
        sectionListRef.current.scrollToLocation({
          sectionIndex: sections.length - 1,
          itemIndex: sections[sections.length - 1].data.length - 1,
          animated: false,
        });
      }, 100);
    }
  }, [sections]);

  const safeChats = Array.isArray(chats) ? chats : [];
  const sections = groupChatsByDate(safeChats);

  console.log('ChatScreen received chats:', number, sections);

  const handleSend = () => {
    // Implement send logic here
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
        <View><Text style={styles.headerText}>{number}</Text></View>
      </View>

      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { date } }) => (
          <View style={styles.dateSection}>
            <Text style={styles.dateSectionText}>{date}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isSent = item.Mode === 'Send';
          const isAttachment = item.MessageType === 'ATTACHMENT';
          const read = item.readstatus === "read";
          const formattedTime = item.ProcessDate
            ? new Date(item.ProcessDate).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
            : '';
          return (
            <View style={[
              styles.messageContainer,
              isSent ? styles.sent : styles.received
            ]}>
               {isAttachment ? (
      <View>
        {/* Call the helper function to render the correct media type */}
        {renderAttachment(item)}

        {/* Display the caption and message text below the attachment */}
        {item.Attachement_Caption ? (
          <Text style={[styles.messageText, { marginTop: 8 }]}>{item.Attachement_Caption}</Text>
        ) : null}
        
        {/* Don't show MessageText if it's the same as the caption */}
        {item.MessageText !== item.Attachement_Caption && (
           <Text style={styles.messageText}>{item.MessageText}</Text>
        )}

      </View>
    ) : (
      <Text style={styles.messageText}>{item.MessageText}</Text>
    )}

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                <Text style={styles.messageTime}>{formattedTime}</Text>
                {isSent && (
                  read ? (
                    <FontAwesome6 name="check-double" size={16} color={COLORS.light.primary} style={{ marginLeft: 4 }} />
                  ) : (
                    <FontAwesome6 name="check" size={16} color='gray' style={{ marginLeft: 4 }} />
                  )
                )}
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() => {
          if (
            sectionListRef.current &&
            sections.length > 0 &&
            sections[sections.length - 1].data.length > 0
          ) {
            sectionListRef.current.scrollToLocation({
              sectionIndex: sections.length - 1,
              itemIndex: sections[sections.length - 1].data.length - 1,
              animated: false,
            });
          }
        }}
        onScrollToIndexFailed={(info) => {
          // Scroll to the end as a fallback
          setTimeout(() => {
            if (sectionListRef.current) {
              sectionListRef.current.scrollToEnd?.({ animated: false });
            }
          }, 100);
        }}
      />

      {checkMessageEligibility ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity onPress={handleSend}>
            <Feather name="send" size={24} color={COLORS.light.primary} style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => navigation.navigate('Templates', { number })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="file-text" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.templateButtonText}>See Template List</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.light.primary,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  messageContainer: {
    marginVertical: 6,
    maxWidth: '80%',
    borderRadius: 10,
    padding: 10,
  },
  sent: {
    backgroundColor: '#d1f7c4',
    alignSelf: 'flex-end',
  },
  received: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  attachmentLabel: {
    fontSize: 13,
    color: '#b3a0e0',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  dateSection: {
    alignSelf: 'center',
    backgroundColor: '#005A9C',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: 8,
  },
  dateSectionText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
  templateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
   mediaImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 4,
  },
  mediaVideo: {
    width: 250,
    height: 180, // Videos are often wider
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#000', // Good practice for video player background
  },
  documentContainer: {
    width: 250,
    padding: 15,
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8EE',
  },
  documentText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    flexShrink: 1, // Ensures text doesn't push the icon off-screen
  },
});

export default ChatScreen;


// const sampleMessages = [
//   {
//     id: '1',
//     text: 'Hi! Thanks for checking your status.',
//     time: '11:49 am',
//     sent: false,
//   },
//   {
//     id: '2',
//     text: 'Costing per message?',
//     time: '11:08 am',
//     sent: true,
//   },
//   {
//     id: '3',
//     text: 'Permission Granted',
//     time: '11:08 am',
//     sent: false,
//   },
// ];