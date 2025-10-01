import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../Constants/Colors';
import Video from 'react-native-video';
import { UserContext } from '../Context/UserContext';

import { saveSentMessage } from '../Utils/api';

const TemplateCard = ({ template, recipientNumber }) => {

  const { Template, TemplateType, ImagePath, FileName, TemplateName, ServiceType, templateId ,Category} = template;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [variableCount, setVariableCount] = useState(0);
  const [variableValues, setVariableValues] = useState([]);
  const [finalMessage, setFinalMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const {user} = useContext(UserContext);  
  
  useEffect(() => {
    const matches = Template.match(/{Variable}/g) || [];
    const count = matches.length;
    setVariableCount(count);
    setVariableValues(Array(count).fill(''));
    setFinalMessage(null);
  }, [Template]);

  // --- API CALL LOGIC for send message ---const sendMessageApi = async ({ to, messageContent, fullTemplate })
  const sendMessageApi = async ({ to, TemplateName,  messageContent, fullTemplate}) => {
    setLoading(true);
    console.log('fullTemplate in API call:', fullTemplate); 
    console.log('messageContent in API call:', messageContent);

    try {
      // Step 1: Opt-in
      const optinUrl = `https://vapi.instaalerts.zone/optin?action=optin&pin=${user.WhatsAppBearer}&optinid=${user.WhatsAppSenderID}&mobile=${to}`;
      const optinRes = await fetch(optinUrl, { method: 'POST' });
      console.log(optinRes);
      if (!optinRes.ok) throw new Error('Opt-in failed');

      // Step 2: Send Message
      const bearerToken = user.WhatsAppBearer; // from context- 'Ze2uKXpEGT3phoZKEVjaiQ=='
      console.log('bearerToken:', bearerToken);
      
      // Build parameterValues if variables exist
      let parameterValues = undefined;
      if (variableCount > 0 && variableValues.length > 0) {
        parameterValues = {};
        variableValues.forEach((val, idx) => {
          parameterValues[idx] = val;
        });
      }

      const payload = {
        "message": {
          "channel": "WABA",
          "content": {
            "preview_url": false,
            "type": "TEMPLATE",
            "template": {
              "templateId": TemplateName,
              ...(parameterValues ? { parameterValues } : {})
            },
          },
          "recipient": {
            "to": to,
            "recipient_type": "individual",
            "reference": {
              "cust_ref": "Some Customer Ref",
              "messageTag1": "Message Tag Val1",
              "conversationId": "Some Optional Conversation ID"
            }
          },
          "sender": {
            "from": user.WhatsAppSenderID
          },
          "preferences": {
            "webHookDNId": "1001"
          }
        },
        "metaData": {
          "version": "v1.0.9"
        }
      };
      console.log('Sending payload:', JSON.stringify(payload, null, 2)); // to check payload
    //  sending template msg to user on whatsapp
      const sendRes = await fetch('https://rcmapi.instaalerts.zone/services/rcm/sendMessage', {
        method: 'POST',
        headers: {
          'Authentication': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log(sendRes);
      
      if (!sendRes.ok) throw new Error('Send message failed');
      const result = await sendRes.json();
      // alert('Message Sent!');
      console.log('API result:', result);
      // API result: {statusCode: '200', statusDesc: 'Successfully Accepted', mid: '410123751001143816805212'}mid: "410123751001143816805212"statusCode: "200"statusDesc: "Successfully Accepted"[[Prototype]]: Object

      // Step 3: Save sent message details to server
      if (result) {
        // Alert.alert('Success', 'Message Sent!');
        /* 
            "Data": [
        {
            "Status": "Admin",
            "Related_DealerCode": "trial",
            "LoginID": "a1030363-9965-468c-a01e-c270f4c88bcd",
            "WhatsAppSenderID": "917877300615",
            "WhatsAppUserName": "LoadWABA",
            "WhatsAppPassword": "Aspcnv33@waba",
            "WhatsAppBearer": "Ze2uKXpEGT3phoZKEVjaiQ=="
        }
    ]
         */
        // 👇 MODIFIED: Prepare the details object with ALL parameters
        const messageDetailsToSave = {
          sender: user.WhatsAppSenderID,
          logId: user.LoginID ,
          receiver: to,
          templateContent: messageContent,
          mid: result.mid,
          serviceType: fullTemplate.ServiceType,
          imagePath: fullTemplate.ImagePath,
        
        };
        
        // Call the save function with the complete details
        saveSentMessage(messageDetailsToSave);

      } else {
        throw new Error('Message sent, but received an invalid response.');
      }

    } catch (err) {
      // Alert.alert('Error: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateText = (text) => {
    const lines = text.split(/\r\n|\n/g);
    return lines.map((line, index) => (
      <Text key={index} style={styles.templateContent}>
        {line.includes('*') ? <Text style={styles.boldText}>{line.replace(/\*/g, '')}</Text> : line}
      </Text>
    ));
  };

  const handleVariableChange = (text, index) => {
    const newValues = [...variableValues];
    newValues[index] = text;
    setVariableValues(newValues);
        console.log('variable values:', variableValues);

  };

  //  "Confirm" button in the modal is clicked
  const handleConfirmVariables = () => {
    let constructedMessage = Template;
    variableValues.forEach(value => {
      // Replace only the first occurrence to handle multiple variables correctly
      constructedMessage = constructedMessage.replace('{Variable}', value || '<empty>');
    });
    setFinalMessage(constructedMessage); // Set the final message for preview
    setIsModalVisible(false); // Close the modal
  };

  //  Final "Send" button is clicked
  const handleFinalSend = () => {
    // Use the finalMessage if it exists, otherwise use the original template
    const messageToSend = finalMessage || Template;

    const to = recipientNumber;
    sendMessageApi({ to, TemplateName, messageContent: messageToSend, fullTemplate: template });
    
  };
     // 👇 MODIFIED: handleFinalSend now passes the entire `template` object
  // const handleFinalSend = () => {
  //   const messageToSend = finalMessage || Template;
  //   const to = recipientNumber;
    
  //   // Pass the final message text and the full template object to the API function
  //   sendMessageApi({ 
  //     to, 
  //     messageContent: messageToSend, 
  //     fullTemplate: template // Pass the whole template prop here
  //   });
  // };


  return (
    <View style={styles.card}>
      {loading && (
        <View style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 10 }}>
          <Text style={{ color: 'blue', textAlign: 'center' }}>Sending...</Text>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Set Template Variables</Text>
            <ScrollView>
              {variableValues.map((value, index) => (
                <View key={index}>
                  <Text style={styles.inputLabel}>Variable #{index + 1}</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => handleVariableChange(text, index)}
                    value={value}
                    placeholder={`Enter value for variable ${index + 1}`}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtonContainer}>
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="gray" />
              <Button title="Confirm" onPress={handleConfirmVariables} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Media Content */}
      {ImagePath && ImagePath !== "https://loadcrm.com/Portal" && (
        <View style={styles.mediaContainer}>
          {TemplateType === 'Image Template' && (
            <Image source={{ uri: ImagePath }} style={styles.mediaImage} resizeMode="contain" />
          )}
          {TemplateType === 'Video Template' && (
            <Video source={{ uri: ImagePath }} style={styles.video} controls={true} paused={true} />
          )}
          {TemplateType === 'Document Template' && (
            <View style={styles.mediaPlaceholder}>
              <Text style={styles.mediaText}>📄 Document: {FileName || 'View'}</Text>
            </View>
          )}
        </View>
      )}

      {/* Original Template Text */}
      <View style={styles.templateBody}>
        <View style={styles.textContainer}>{renderTemplateText(Template)}</View>

        {/* Step 4: Show the final message preview if it exists */}
        {finalMessage && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview:</Text>
            <Text style={styles.previewContent}>{finalMessage}</Text>
          </View>
        )}
         <View>
            <Text>Category: <Text style={styles.boldText}>{Category}</Text></Text>
          </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {variableCount > 0 && (
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)} // Step 2: Open modal
              style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>{finalMessage ? 'Edit Variables' : 'Set Variables'}</Text>
            </TouchableOpacity>
          )}
            
          <TouchableOpacity
            onPress={handleFinalSend} 
            style={[styles.button, styles.primaryButton]}
            // Disable send button if variables are required but not yet set
            disabled={variableCount > 0 && !finalMessage}>
            <Text style={styles.primaryButtonText}>Send</Text>
          </TouchableOpacity>
        
        </View>
      </View>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Ensures media corners are rounded
  },
  templateBody: {
    padding: 15,
  },
  textContainer: {
    marginBottom: 15,
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
    backgroundColor: '#f0f0f0',
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  video: {
    width: "100%",
    height: 200,
  },
  mediaPlaceholder: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  mediaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  previewContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  previewContent: {
    color: '#555',
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.light.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginTop: 10,
    color: 'gray',
  },
  input: {
    height: 40,
    width: 250,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});

export default TemplateCard;