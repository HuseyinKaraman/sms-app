import React, { useState, useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, Platform, PermissionsAndroid, NativeModules, FlatList } from 'react-native';

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [hasSmsPermission, setHasSmsPermission] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState([]);

  useEffect(() => {
    checkSmsPermission();
    
    // SMS dinleme için interval
    const interval = setInterval(() => {
      if (hasSmsPermission && phoneNumber) {
        getIncomingSms();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [hasSmsPermission, phoneNumber]);

  const checkSmsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const sendGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'SMS Gönderme İzni',
            message: 'Bu uygulama SMS göndermek için izin istiyor.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          },
        );
        
        const readGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Okuma İzni',
            message: 'Bu uygulama SMS okumak için izin istiyor.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          },
        );
        
        const receiveGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'SMS Alma İzni',
            message: 'Bu uygulama SMS almak için izin istiyor.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          },
        );
        
        if (sendGranted === PermissionsAndroid.RESULTS.GRANTED && 
            readGranted === PermissionsAndroid.RESULTS.GRANTED &&
            receiveGranted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasSmsPermission(true);
          console.log('Tüm SMS izinleri verildi');
        } else {
          console.log('Bazı SMS izinleri reddedildi');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const getIncomingSms = async () => {
    if (!phoneNumber || !hasSmsPermission) return;
    
    try {
      const SmsReceiver = NativeModules.SmsReceiver;
      if (SmsReceiver) {
        SmsReceiver.getIncomingSms(phoneNumber)
          .then(messages => {
            if (messages && messages.length > 0) {
              console.log("Yeni SMS'ler alındı:", messages);
              setReceivedMessages(prevMessages => {
                // Yeni mesajlar ekle, aynı ID'li mesajları kontrol et
                const newMessages = [...prevMessages];
                
                messages.forEach(newMsg => {
                  const exists = newMessages.some(msg => 
                    msg.id === newMsg.id || 
                    (msg.body === newMsg.body && msg.date === newMsg.date)
                  );
                  
                  if (!exists) {
                    newMessages.unshift(newMsg);
                  }
                });
                
                return newMessages;
              });
            }
          })
          .catch(err => {
            console.log("SMS alınamadı:", err);
          });
      } else {
        console.log("SmsReceiver modülü bulunamadı");
      }
    } catch (error) {
      console.log('SMS alma hatası:', error);
    }
  };

  const sendSMS = async () => {
    if (!phoneNumber || !message) {
      Alert.alert('Hata', 'Lütfen telefon numarası ve mesaj giriniz.');
      return;
    }

    if (Platform.OS === 'android' && hasSmsPermission) {
      try {
        // Doğrudan Android SMS göndermek için
        const DirectSms = NativeModules.DirectSms;
        if (DirectSms) {
          DirectSms.sendDirectSms(phoneNumber, message)
            .then(() => {
              Alert.alert('Başarılı', 'SMS başarıyla gönderildi!');
              
              // Gönderilen mesajı da listeye ekle
              const sentMsg = {
                id: 'sent_' + Date.now(),
                body: message,
                date: Date.now().toString(),
                sender: 'Ben',
                isSent: true
              };
              
              setReceivedMessages(prev => [sentMsg, ...prev]);
              setMessage('');
            })
            .catch(err => {
              Alert.alert('Hata', 'SMS gönderilirken bir sorun oluştu: ' + err);
            });
        } else {
          Alert.alert('Hata', 'DirectSms modülü bulunamadı.');
        }
      } catch (error) {
        console.log('SMS gönderme hatası:', error);
        Alert.alert('Hata', 'SMS gönderilirken bir sorun oluştu');
      }
    } else {
      Alert.alert('İzin Gerekli', 'SMS göndermek için izin gerekiyor veya desteklenmiyor.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageItem, item.isSent ? styles.sentMessage : styles.receivedMessage]}>
      <Text style={styles.messageSender}>{item.isSent ? 'Ben' : 'Gönderen'}</Text>
      <Text style={styles.messageBody}>{item.body}</Text>
      <Text style={styles.messageDate}>
        {new Date(parseInt(item.date)).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SMS Uygulaması</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Telefon Numarası:</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Telefon numarası girin"
          keyboardType="phone-pad"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mesaj:</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Mesajınızı yazın"
          multiline
        />
      </View>
      
      <Button 
        title="SMS Gönder" 
        onPress={sendSMS}
        disabled={!hasSmsPermission}
      />

      {!hasSmsPermission && (
        <Text style={styles.warning}>
          SMS özellikleri için tüm izinleri vermeniz gerekiyor.
        </Text>
      )}

      <View style={styles.messagesContainer}>
        <Text style={styles.messagesTitle}>Mesajlar</Text>
        <FlatList
          data={receivedMessages}
          renderItem={renderItem}
          keyExtractor={item => item.id || item.date}
          ListEmptyComponent={
            <Text style={styles.noMessages}>
              Henüz mesaj yok. Bir mesaj gönderin veya alın.
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  note: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic'
  },
  warning: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    borderLeftWidth: 3,
  },
  sentMessage: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    marginLeft: 20,
  },
  receivedMessage: {
    borderLeftColor: '#2196F3',
    marginRight: 20,
  },
  messageSender: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
  },
  messageBody: {
    fontSize: 16,
    marginBottom: 5,
  },
  messageDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  noMessages: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  }
}); 