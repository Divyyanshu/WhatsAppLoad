import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Video from 'react-native-video'; // ensure this is installed: npm i react-native-video
import { COLORS } from '../Constants/Colors';
// update the path as per your project

const ChatAttachment = ({ chat }) => {
  if (!chat) return null;

  const uri = chat.Imagepath || chat.Attachement_Data || chat.FileData || '';
  const type = (chat.Attachement_Type || '').toLowerCase();

  if (!uri) return null;

  // --- IMAGE ---
  if (type === 'image' || uri.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return (
      <TouchableOpacity
        onPress={() => Linking.openURL(uri)}
        style={{ alignItems: 'center' }}
      >
        <Image source={{ uri }} style={styles.mediaImage} resizeMode="cover" />
        {chat.Attachement_Caption ? (
          <Text style={styles.captionText}>{chat.Attachement_Caption}</Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  // --- VIDEO ---
  if (type === 'video' || uri.match(/\.(mp4|mov|avi|mkv)$/i)) {
    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri }}
          style={styles.mediaVideo}
          controls
          resizeMode="contain"
        />
        {chat.Attachement_Caption ? (
          <Text style={styles.captionText}>{chat.Attachement_Caption}</Text>
        ) : null}
      </View>
    );
  }

  // --- AUDIO ---
  if (type === 'audio' || uri.match(/\.(mp3|wav|m4a|aac)$/i)) {
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

  // --- DOCUMENT ---
  if (type === 'document' || uri.match(/\.(pdf|doc|docx|xls|xlsx|txt)$/i)) {
    return (
      <TouchableOpacity
        onPress={() => Linking.openURL(uri)}
        style={styles.docContainer}
      >
        <Feather name="file-text" size={24} color={COLORS.light.primary} />
        <Text style={styles.documentText}>
          {chat.Attachement_Caption || 'Open Document'}
        </Text>
      </TouchableOpacity>
    );
  }

  return null;
};

export default ChatAttachment;

const styles = StyleSheet.create({
  mediaImage: {
    width: 220,
    height: 200,
    borderRadius: 12,
    marginTop: 6,
  },
  mediaVideo: {
    width: 250,
    height: 200,
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#000',
  },
  captionText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.light.textPrimary || '#444',
    textAlign: 'center',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  audioText: {
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.light.primary,
    fontWeight: '500',
  },
  docContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  documentText: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.light.primary,
    fontWeight: '500',
  },
});
