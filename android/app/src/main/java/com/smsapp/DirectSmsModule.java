package com.smsapp;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.telephony.SmsManager;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class DirectSmsModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    DirectSmsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "DirectSms";
    }

    @ReactMethod
    public void sendDirectSms(String phoneNumber, String message, Promise promise) {
        try {
            SmsManager smsManager = SmsManager.getDefault();
            Activity currentActivity = getCurrentActivity();
            
            if(currentActivity == null) {
                promise.reject("ERROR", "Activity is null");
                return;
            }
            
            // SMS gönderme işlemi
            String SENT = "SMS_SENT";
            String DELIVERED = "SMS_DELIVERED";
            
            PendingIntent sentPI = PendingIntent.getBroadcast(reactContext, 0, new Intent(SENT), PendingIntent.FLAG_IMMUTABLE);
            PendingIntent deliveredPI = PendingIntent.getBroadcast(reactContext, 0, new Intent(DELIVERED), PendingIntent.FLAG_IMMUTABLE);
            
            // SMS başarıyla gönderildi mi?
            BroadcastReceiver sentReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    switch (getResultCode()) {
                        case Activity.RESULT_OK:
                            promise.resolve("SMS gönderildi");
                            break;
                        default:
                            promise.reject("ERROR", "SMS gönderilemedi");
                            break;
                    }
                    reactContext.unregisterReceiver(this);
                }
            };
            
            // SMS başarıyla alındı mı?
            BroadcastReceiver deliveredReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    switch (getResultCode()) {
                        case Activity.RESULT_OK:
                            // SMS iletildi
                            break;
                        case Activity.RESULT_CANCELED:
                            // SMS teslim edilemedi
                            break;
                    }
                    reactContext.unregisterReceiver(this);
                }
            };
            
            // Alıcıları kaydet
            reactContext.registerReceiver(sentReceiver, new IntentFilter(SENT));
            reactContext.registerReceiver(deliveredReceiver, new IntentFilter(DELIVERED));
            
            // SMS gönder
            smsManager.sendTextMessage(phoneNumber, null, message, sentPI, deliveredPI);
            
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
} 