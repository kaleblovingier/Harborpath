package org.harborpath.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebView;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Privacy Invariant: Zero analytics / zero trackers initialized.

        Window window = getWindow();
        // Enable edge-to-edge so content can draw under system bars and cutouts,
        // then we explicitly apply the safe insets so UI is not cut off.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
        } else {
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
        }

        // Light status bar icons when background is light; adjust as needed for dark mode.
        WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(true);

        // Apply system bar + cutout insets as CSS custom properties on the WebView
        // so existing --sat / env(safe-area-*) styles work reliably on Android.
        ViewCompat.setOnApplyWindowInsetsListener(window.getDecorView(), (v, insets) -> {
            int top = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            ).top;
            int bottom = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom;
            int left = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            ).left;
            int right = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            ).right;

            // Convert px to CSS px (density-independent) for the web layer
            float density = getResources().getDisplayMetrics().density;
            int cssTop = Math.round(top / density);
            int cssBottom = Math.round(bottom / density);
            int cssLeft = Math.round(left / density);
            int cssRight = Math.round(right / density);

            WebView webView = getBridge().getWebView();
            if (webView != null) {
                String js = String.format(
                    "document.documentElement.style.setProperty('--sat','%dpx');" +
                    "document.documentElement.style.setProperty('--sab','%dpx');" +
                    "document.documentElement.style.setProperty('--sal','%dpx');" +
                    "document.documentElement.style.setProperty('--sar','%dpx');",
                    cssTop, cssBottom, cssLeft, cssRight
                );
                webView.post(() -> webView.evaluateJavascript(js, null));
            }
            return insets;
        });
    }
}
