import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image, SectionList, TouchableOpacity } from 'react-native';
import { COLORS } from '../Constants/Colors';

import Feather from 'react-native-vector-icons/Feather'; // Using Feather icons
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'; // Using Feather icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'https://www.loadcrm.com/whatsappmobileapis/api';
const sampleMessages = [
  {
    id: '1',
    text: 'Hi! Thanks for checking your status.',
    time: '11:49 am',
    sent: false,
  },
  {
    id: '2',
    text: 'Costing per message?',
    time: '11:08 am',
    sent: true,
  },
  {
    id: '3',
    text: 'Permission Granted',
    time: '11:08 am',
    sent: false,
  },
];

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


const ChatScreen = ({ route }) => {
  const { number, chats } = route.params;
  const [checkMessageEligibility, setCheckMessageEligibility] = useState(false);
  console.log('checkMessageEligibility', checkMessageEligibility);
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const sectionListRef = useRef(null);

  // Check message eligibility  here for showing templete option or input box
  const checkEligibility = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const senderNo = user.WhatsAppSenderID;
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
                  {item.Imagepath ? (
                    <Image
                      source={{ uri: item.Imagepath }}
                      style={{ width: 200, height: 200, borderRadius: 10, marginBottom: 4 }}
                      resizeMode="cover"
                    />
                  ) : null}
                  {item.Attachement_Caption ? (
                    <Text style={styles.messageText}>{item.Attachement_Caption}</Text>
                  ) : null}
                  <Text style={styles.messageText}>{item.MessageText}</Text>
                </View>
              ) : (
                <Text style={styles.messageText}>{item.MessageText}</Text>
              )}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.messageTime}>{formattedTime}</Text>
                {read ? (
                  <FontAwesome6 name="check-double" size={16} color={COLORS.light.primary} style={{ marginLeft: 4 }} />
                ) : (
                  <FontAwesome6 name="check" size={16} color={COLORS.light.primary} style={{ marginLeft: 4 }} />
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
            onPress={() => navigation.navigate('Templates')}
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
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: 8,
  },
  dateSectionText: {
    fontSize: 13,
    color: '#888',
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
});

export default ChatScreen;




{/* <FlatList
        data={sampleMessages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.sent ? styles.sent : styles.received]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      /> */}