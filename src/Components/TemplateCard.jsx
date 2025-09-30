// src/components/TemplateCard.jsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { COLORS } from '../Constants/Colors';
import Video  from 'react-native-video';
const TemplateCard = ({ template }) => {
  const { TemplateName, TemplateType, Template, ImagePath, FileName, Category } = template;

  // Function to render the template message, handling newlines and variables
  const renderTemplateText = (text) => {
    // Replace {Variable} placeholders with a visual indicator
    const formattedText = text.replace(/{Variable}/g, '<VARIABLE>');
    
    // Split by \r\n to render as separate text lines
    const lines = formattedText.split(/\r\n|\n/g);
    return lines.map((line, index) => (
      <Text key={index} style={styles.templateContent}>
        {/* Basic parsing for bold/italic if needed, or use a rich text component */}
        {line.includes('*') ? <Text style={styles.boldText}>{line.replace(/\*/g, '')}</Text> : line}
      </Text>
    ));
  };

  // const handleMediaPress = () => {
  //   if (ImagePath) {
  //     // For images, videos, and documents, attempt to open the URL
  //     Linking.openURL(ImagePath).catch(err => console.error("Couldn't load page", err));
  //   }
  // };

  return (
    <View style={styles.card}>
      {/* <Text style={styles.templateName}>{TemplateName}</Text>
      <Text style={styles.templateType}>Type: {TemplateType}</Text>
      {Category && <Text style={styles.category}>Category: {Category}</Text>} */}
      {/* Display media if ImagePath is available and it's not a Text Template */}
        {ImagePath && ImagePath !== "https://loadcrm.com/Portal" && (
          <TouchableOpacity  style={styles.mediaContainer}>
            {TemplateType === 'Image Template' && (
              <Image source={{ uri: ImagePath }} style={styles.mediaImage} resizeMode="contain" />
            )}
            {TemplateType === 'Video Template' && (
               <Video
        source={{ uri: ImagePath }}
        style={styles.video}
        controls={true}   // shows play/pause/seek controls
        resizeMode="contain" // contain, cover, stretch
        paused={true}   // autoplay (set true if you want it paused initially)
      />
            )}
            {TemplateType === 'Document Template' && (
              <View style={styles.mediaPlaceholder}>
                <Text style={styles.mediaText}>📄 Document: {FileName || 'Click to View'}</Text>
                <Text style={styles.mediaLink}>{ImagePath}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

      <View style={styles.templateBody}>
        {/* Render text templates or captions for media */}
        {(TemplateType === 'Text Template' || Template) && (
          <View style={styles.textContainer}>
            {renderTemplateText(Template)}
          </View>
        )}

        <View style={{ alignItems: 'flex-end', }}>
          <TouchableOpacity  style={{ backgroundColor: COLORS.light.primary, paddingHorizontal: 20,paddingVertical:5, borderRadius: 5}}>
          <Text style={{ color: '#fff' }}>Send</Text>
        </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  templateType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  templateBody: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  textContainer: {
    marginBottom: 10,
  },
  templateContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  mediaContainer: {
    marginTop: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  mediaImage: {
    width: '100%',
    height: 250, // Fixed height for images
  },
  mediaPlaceholder: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100, // Fixed height for video/document placeholders
  },
  mediaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  mediaLink: {
    fontSize: 12,
    color: '#007bff', // Blue for links
    textDecorationLine: 'underline',
  },
   video: {
    width: "100%",
    height: 250,   // adjust as needed
  }
});

export default TemplateCard;