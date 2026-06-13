package com.udidura.app;

import android.content.Intent;
import android.os.Parcelable;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;

@CapacitorPlugin(name = "ShareIntent")
public class ShareIntentPlugin extends Plugin {

    private static ShareIntentPlugin instance;
    private static String pendingSharedText;

    @Override
    public void load() {
        instance = this;
    }

    @PluginMethod
    public void getPendingShare(PluginCall call) {
        JSObject result = new JSObject();
        result.put("text", pendingSharedText == null ? JSObject.NULL : pendingSharedText);
        pendingSharedText = null;
        call.resolve(result);
    }

    static void handleIntent(Intent intent) {
        String sharedText = extractSharedText(intent);
        if (sharedText == null || sharedText.trim().isEmpty()) {
            return;
        }

        pendingSharedText = sharedText;

        if (instance != null) {
            JSObject data = new JSObject();
            data.put("text", sharedText);
            instance.notifyListeners("shareReceived", data, true);
        }
    }

    private static String extractSharedText(Intent intent) {
        if (intent == null) {
            return null;
        }

        String action = intent.getAction();
        if (Intent.ACTION_SEND.equals(action)) {
            return extractSingleShareText(intent);
        }

        if (Intent.ACTION_SEND_MULTIPLE.equals(action)) {
            ArrayList<Parcelable> streams = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (streams != null && !streams.isEmpty()) {
                return streams.get(0).toString();
            }
        }

        return null;
    }

    private static String extractSingleShareText(Intent intent) {
        String text = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (text != null && !text.trim().isEmpty()) {
            return text;
        }

        String subject = intent.getStringExtra(Intent.EXTRA_SUBJECT);
        if (subject != null && !subject.trim().isEmpty()) {
            return subject;
        }

        if (intent.getDataString() != null) {
            return intent.getDataString();
        }

        Parcelable stream = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        return stream == null ? null : stream.toString();
    }
}

