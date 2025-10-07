import axios from 'axios';
import { API_URL } from '../config';

export const saveSentMessage = async (messageDetails) => {
  const API_BASE_URL = API_URL; 
  const endpoint = 'StoreSendWhatsMessageDataV1';
  const payload = {
    SenderID: messageDetails.sender,
    WhatsAppDealerProfileID: messageDetails.logId,
    ClientMobileNo: messageDetails.receiver,
    MessageType: messageDetails.messageType || '',
    MessageText: messageDetails.templateContent,
    Mid: messageDetails.mid,
    ServiceType: messageDetails.serviceType || 'AUTO', 
    ImagePath: messageDetails.imagePath || '', 
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
