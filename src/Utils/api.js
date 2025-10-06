import axios from 'axios';
import { API_URL } from '../config';


// function to save sent message details to the server
export const saveSentMessage = async (messageDetails) => {
  const API_BASE_URL = API_URL; 
  const endpoint = 'StoreSendWhatsMessageDataV1';

  // The payload now includes all parameters from your Java example
  const payload = {
    SenderID: messageDetails.sender,
    WhatsAppDealerProfileID: messageDetails.logId,
    ClientMobileNo: messageDetails.receiver,
    MessageType: messageDetails.messageType || '', // // ATTACHMENT or TEXT
    MessageText: messageDetails.templateContent,
    Mid: messageDetails.mid,
    ServiceType: messageDetails.serviceType || 'AUTO', 
    ImagePath: messageDetails.imagePath || '', // Pass the image path if it exists
    FileData: '',
    attachment_type: messageDetails.attachmentName,
    attachment_mimeType: '',
    attachment_caption: '',
    ButtonTemplateType: '',
    HeaderText: '',
    FooterText: '',
    ButtonJsonList: '',
    ListButtonName: '',
  };
 console.log('Payload for saving sent message:', JSON.stringify(payload));
  try {
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, payload);
    console.log('Response from saving sent message:',response,  response.data);
    if (response.status === 200) {
      console.log('Chat history saved successfully with all params:', response.data);
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to save chat history:', error);
    return { success: false, error };
  }
};





 // --- API CALL LOGIC for send message ---const sendMessageApi = async ({ to, messageContent, fullTemplate })
  // const sendMessageApi = async ({ to, TemplateName,  messageContent, fullTemplate}) => {
  //   setLoading(true);
  //   console.log('fullTemplate in API call:', fullTemplate); 
  //   console.log('messageContent in API call:', messageContent);

  //   try {
  //     // Step 1: Opt-in
  //     const optinUrl = `https://vapi.instaalerts.zone/optin?action=optin&pin=${user.WhatsAppBearer}&optinid=${user.WhatsAppSenderID}&mobile=${to}`;
  //     const optinRes = await fetch(optinUrl, { method: 'POST' });
  //     console.log(optinRes);
  //     if (!optinRes.ok) throw new Error('Opt-in failed');

  //     // Step 2: Send Message
  //     const bearerToken = user.WhatsAppBearer; // from context- 'Ze2uKXpEGT3phoZKEVjaiQ=='
  //     console.log('bearerToken:', bearerToken);
      
  //     // Build parameterValues if variables exist
  //     let parameterValues = undefined;
  //     if (variableCount > 0 && variableValues.length > 0) {
  //       parameterValues = {};
  //       variableValues.forEach((val, idx) => {
  //         parameterValues[idx] = val;
  //       });
  //     }
  // /* for Image Template-  
  //      "content":{
  //      "type": "MEDIA_TEMPLATE",
  //      }

  // */


  //     const payload = {
  //       "message": {
  //         "channel": "WABA",
  //         "content": {
  //           "preview_url": false,
  //           "type": "TEMPLATE",
  //           "template": {
  //             "templateId": TemplateName,
  //             ...(parameterValues ? { parameterValues } : {})
  //           },
  //         },
  //         "recipient": {
  //           "to": to,
  //           "recipient_type": "individual",
  //           "reference": {
  //             "cust_ref": "Some Customer Ref",
  //             "messageTag1": "Message Tag Val1",
  //             "conversationId": "Some Optional Conversation ID"
  //           }
  //         },
  //         "sender": {
  //           "from": user.WhatsAppSenderID
  //         },
  //         "preferences": {
  //           "webHookDNId": "1001"
  //         }
  //       },
  //       "metaData": {
  //         "version": "v1.0.9"
  //       }
  //     };

  //     console.log('Sending payload:', JSON.stringify(payload, null, 2)); // to check payload
  //   //  sending template msg to user on whatsapp
  //     const sendRes = await fetch('https://rcmapi.instaalerts.zone/services/rcm/sendMessage', {
  //       method: 'POST',
  //       headers: {
  //         'Authentication': `Bearer ${bearerToken}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(payload),
  //     });
  //     console.log(sendRes);
      
  //     if (!sendRes.ok) throw new Error('Send message failed');
  //     const result = await sendRes.json();
  //     // alert('Message Sent!');
  //     console.log('API result:', result);
  //     // API result: {statusCode: '200', statusDesc: 'Successfully Accepted', mid: '410123751001143816805212'}mid: "410123751001143816805212"statusCode: "200"statusDesc: "Successfully Accepted"[[Prototype]]: Object

  //     // Step 3: Save sent message details to server
  //     if (result) {
  //        console.log('Message sent successfully, now saving details to server...');
  //       // 👇 MODIFIED: Prepare the details object with ALL parameters
  //       const messageDetailsToSave = {
  //         sender: user.WhatsAppSenderID,
  //         logId: user.LoginID ,
  //         receiver: to,
  //         templateContent: messageContent,
  //         mid: result.mid,
  //         serviceType: fullTemplate.ServiceType,
  //         imagePath: fullTemplate.ImagePath,    
  //       };
        
  //       // Call the save function with the complete details
  //       saveSentMessage(messageDetailsToSave);

  //     } else {
  //       throw new Error('Message sent, but received an invalid response.');
  //     }

  //   } catch (err) {
  //     // Alert.alert('Error: ' + err.message);
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };