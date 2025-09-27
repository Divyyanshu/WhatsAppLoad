import React from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image, SectionList } from 'react-native';
import { COLORS } from '../Constants/Colors';

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
  const safeChats = Array.isArray(chats) ? chats : [];
  const sections = groupChatsByDate(safeChats);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
        <View>  <Text style={styles.headerText}>{number}</Text> </View>
      </View>

      <SectionList
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
                  {/* <Text style={styles.attachmentLabel}>Attachment:</Text> */}
                  {item.Imagepath ? (
                    <Image
                      source={{ uri: item.Imagepath }}
                      style={{ width: 180, height: 180, borderRadius: 10, marginBottom: 4 }}
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
              <Text style={styles.messageTime}>{formattedTime}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Message" />
      </View>
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
    padding: 10,
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