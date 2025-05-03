package com.smsapp;

import android.app.Activity;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.Telephony;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.List;

public class SmsReceiverModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    SmsReceiverModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "SmsReceiver";
    }

    @ReactMethod
    public void getIncomingSms(String phoneNumber, Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.reject("ERROR", "Activity is null");
                return;
            }

            List<SmsMessage> messages = getSmsFromPhone(phoneNumber);
            WritableArray result = Arguments.createArray();

            for (SmsMessage message : messages) {
                WritableMap map = Arguments.createMap();
                map.putString("id", message.getId());
                map.putString("address", message.getAddress());
                map.putString("body", message.getBody());
                map.putString("date", message.getDate());
                map.putBoolean("read", message.isRead());
                result.pushMap(map);
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    private List<SmsMessage> getSmsFromPhone(String phoneNumber) {
        List<SmsMessage> smsMessages = new ArrayList<>();
        ContentResolver contentResolver = reactContext.getContentResolver();
        Uri uri = Uri.parse("content://sms/inbox");

        // En son alınan 20 mesajı al
        String sortOrder = "date DESC LIMIT 20";
        String selection = null;
        String[] selectionArgs = null;

        // Eğer telefon numarası belirtilmişse, sadece o numaradan gelen mesajları al
        if (phoneNumber != null && !phoneNumber.isEmpty()) {
            selection = "address LIKE ?";
            selectionArgs = new String[]{"%" + phoneNumber + "%"};
        }

        try (Cursor cursor = contentResolver.query(uri, null, selection, selectionArgs, sortOrder)) {
            if (cursor != null && cursor.moveToFirst()) {
                int idIndex = cursor.getColumnIndex("_id");
                int addressIndex = cursor.getColumnIndex("address");
                int bodyIndex = cursor.getColumnIndex("body");
                int dateIndex = cursor.getColumnIndex("date");
                int readIndex = cursor.getColumnIndex("read");

                do {
                    String id = cursor.getString(idIndex);
                    String address = cursor.getString(addressIndex);
                    String body = cursor.getString(bodyIndex);
                    String date = cursor.getString(dateIndex);
                    boolean read = cursor.getInt(readIndex) == 1;

                    smsMessages.add(new SmsMessage(id, address, body, date, read));
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return smsMessages;
    }

    // SMS mesaj sınıfı
    private static class SmsMessage {
        private final String id;
        private final String address;
        private final String body;
        private final String date;
        private final boolean read;

        SmsMessage(String id, String address, String body, String date, boolean read) {
            this.id = id;
            this.address = address;
            this.body = body;
            this.date = date;
            this.read = read;
        }

        public String getId() {
            return id;
        }

        public String getAddress() {
            return address;
        }

        public String getBody() {
            return body;
        }

        public String getDate() {
            return date;
        }

        public boolean isRead() {
            return read;
        }
    }
} 