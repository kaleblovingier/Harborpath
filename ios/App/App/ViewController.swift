import UIKit
import Capacitor

class ViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        // Ensure webview safe area insets respect iOS Dynamic Island / Notch
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
    }
}
