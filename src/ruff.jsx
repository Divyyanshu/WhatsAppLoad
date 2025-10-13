function connectWebSocket() {
  if (senderid && clientnumber) {
    ws = new WebSocket(
      `wss://www.loadcrm.com/whatsappwebsocket/ws?SenderId=${senderid}&ClientId=${clientnumber}&user=${user}&SysIpAdress=${MacAddress}`,
    );
    //ws = new WebSocket(`wss://localhost:44370/ws?SenderId=${senderid}&ClientId=${clientnumber}&user=${user}`);

    ws.onopen = function () {
      console.log('WebSocket connected');
    };

    ws.onmessage = function (event) {
      console.log('Message received:', event.data);
      const data = JSON.parse(event.data);
      const messages = Array.isArray(data) ? data : [data];

      const commonStyles = {
        container:
          "width: 100%; margin-top: 8px; float: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;",
        containerRight:
          "width: 100%; margin-top: 8px; float: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;",
        messageBoxReceived:
          'min-width: 20%; max-width: 60%; background-color: #ffffff; color: #333333; border-radius: 12px; float: left; padding: 12px 16px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); font-size: 14px; line-height: 1.4; position: relative;',
        messageBoxSent:
          'min-width: 20%; max-width: 60%; background-color: #dcf8c6; color: #414141; border-radius: 12px; float: right; padding: 12px 16px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); font-size: 14px; line-height: 1.4; position: relative;',
        messageText:
          'margin: 0 0 8px 0; display: block; word-break: break-word;',
        timestamp:
          'text-align: right; font-size: 11px; color: #a0a0a0; margin: 4px 0 0 0;',
        image:
          'width: 200px; height: 200px; border-radius: 8px; margin: 8px 0;',
        iframe:
          'width: 300px; height: 200px; border: none; border-radius: 8px; margin: 8px 0;',
        headerText: 'margin: 0 0 8px 0; font-size: 16px; font-weight: bold;',
        footerText: 'margin: 8px 0 4px 0; font-size: 12px; color: #666;',
        separator: 'border-top: 1px solid #786e6e; margin: 8px 0; width: 100%;',
        buttonContainer: 'text-align: center; margin: 8px 0;',
        button:
          'margin: 4px 2px; padding: 8px 12px; border: none; width: 100%; background-color: white; color: #198754; border-radius: 5px; cursor: pointer;',
        checkmarkRead:
          'position: absolute; right: 8px; bottom: 4px; font-size: 10pt; color: #34b7f1;',
        checkmarkSent:
          'position: absolute; right: 8px; bottom: 4px; font-size: 10pt; color: #959595;',
        checkmarkDelivered:
          'position: absolute; right: 8px; bottom: 4px; font-size: 10pt; color: #959595;',
      };

      messages.forEach(item => {
        const processDate = new Date(item.ProcessDate);

        if (item.Mode === 'Received') {
          if (
            item.SenderID === senderid &&
            item.ClientMobileno == clientnumber
          ) {
            $('#ShowMessageHistory').append(
              renderReceivedText(item, processDate),
            );
          }
        } else if (item.Mode === 'DocumentReceived') {
          if (
            item.SenderID === clientnumber &&
            item.ClientMobileno == senderid
          ) {
            const mimeType = item.Attachement_MineType;

            GetSecureImage(item, processDate, function (imageObjectURL) {
              if (mimeType === 'image/jpeg') {
                $('#ShowMessageHistory').append(
                  renderImageFromClient(imageObjectURL, item, processDate),
                );
              } else if (mimeType === 'audio/mp4') {
                $('#ShowMessageHistory').append(
                  renderAllaudiofromClient(imageObjectURL, item, processDate),
                );
              } else if (mimeType === 'video/mp4') {
                $('#ShowMessageHistory').append(
                  renderAllVideofromClient(imageObjectURL, item, processDate),
                );
              } else {
                $('#ShowMessageHistory').append(
                  renderAllDocumentsfromClient(
                    imageObjectURL,
                    item,
                    processDate,
                  ),
                );
              }
            });
          }
        } else if (item.Mode === 'Send') {
          debugger;
          if (
            item.SenderID === senderid &&
            item.ClientMobileno === clientnumber
          ) {
            if (item.MessageType === 'TEXT') {
              $('#ShowMessageHistory').append(
                renderSendText(item, processDate),
              );
            }
            if (item.MessageType == 'Button') {
              $('#ShowMessageHistory').append(
                renderButtonMessage(item, processDate),
              );
            }
          }
        }
      });
    };

    ws.onclose = function (event) {
      console.log(
        'WebSocket closed. Code:',
        event.code,
        'Reason:',
        event.reason,
      );
      setTimeout(connectWebSocket, reconnectInterval);
    };

    ws.onerror = function (error) {
      console.error('WebSocket error:', error);
      ws.close(); // Ensures reconnection is triggered
    };
  } else if (senderid) {
    ws1 = new WebSocket(
      `wss://www.loadcrm.com/whatsappwebsocket/ws?SenderId=${senderid}&user=${user}&SysIpAdress=${MacAddress}`,
    );
    //ws1 = new WebSocket(`wss://localhost:44370/ws?SenderId=${senderid}&user=${user}`);
    ws1.onopen = function () {
      console.log('Global WebSocket connected');
    };

    ws1.onmessage = function (event) {
      console.log('Message received:', event.data);
      const data = JSON.parse(event.data);
      const messages = Array.isArray(data) ? data : [data];
      messages.forEach(item => {
        if (
          item.SenderID === senderid &&
          item.ClientMobileNo === clientnumber
        ) {
          updateseencount(clientnumber, senderid); //client - 9001554018
        }
      });
      GetpageLoadownWhatsnumber();

      // MsgNotification();
    };

    ws1.onclose = function (event) {
      console.log(
        'Gloabal WebSocket closed. Code:',
        event.code,
        'Reason:',
        event.reason,
      );
      setTimeout(connectWebSocket, reconnectInterval);
    };

    ws1.onerror = function (error) {
      console.error('Gloabal WebSocket error:', error);
      ws1.close(); // Ensures reconnection is triggered
    };
  } else {
    console.warn('Data missing.');
  }
}
