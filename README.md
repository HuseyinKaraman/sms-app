# SMS Uygulaması

Bu React Native uygulaması, Expo kullanarak SMS gönderme ve alma işlevleri sunar.

## Özellikler

- SMS gönderme
- Belirli bir numaradan gelen SMS'leri dinleme ve görüntüleme
- Kullanıcı dostu arayüz
- Android ve iOS desteği (Android'de tam SMS özellikleri)

## Kurulum

1. Bu projeyi klonlayın
2. Proje dizinine gidin: `cd sms-app`
3. Gerekli paketleri yükleyin: `npm install`

## Çalıştırma

### Expo CLI ile çalıştırma:

```
npm start
```

Sonra Expo Go uygulamasını kullanarak QR kodu tarayabilir veya aşağıdaki komutlarla doğrudan emülatör/cihazda çalıştırabilirsiniz:

- Android: `npm run android`
- iOS: `npm run ios` (Not: iOS için MacOS gerekmektedir)

### Dikkat Edilmesi Gerekenler

- Uygulamanın çalışması için SMS izinlerini vermeniz gerekmektedir.
- iOS'ta SMS özellikleri sınırlıdır (sadece SMS gönderme isteği oluşturabilir).
- Uygulama sadece Expo ile paketlenmiş şekilde çalışır.

## Notlar

Bu uygulama, cihazda SMS izinleri verildiği takdirde belirli bir numaraya SMS gönderebilir ve o numaradan gelen SMS'leri dinleyebilir. Gelen SMS'ler otomatik olarak arayüzde listelenir.

## Teknik Detaylar

- Expo SDK: >=49.0.0
- React Native: 0.73.2
- SMS işlevleri için kullanılan kütüphaneler: 
  - expo-sms
  - react-native-get-sms-android 