## [t4] Prevent menu-dismissal Escape from triggering Quick Exit
- Codebase/domain discoveries: `app.js` owns both navigation dismissal and double-Escape Quick Exit; handling the menu first prevents event-order overlap. The app’s build/lint checks also validate the generated service-worker build stamp.
- Wrong assumptions and corrections: a menu-dismissal Escape must not count as the first Quick Exit Escape; UI tests alone were not enough to validate focus, so the open local app was checked in a browser.
- Debugging dead-ends and what actually worked: the first lint/build attempt surfaced a stale service-worker hash after the client script changed; `npm run stamp:sw` refreshed it and both checks then passed.
- Techniques/patterns worth reusing: give navigation Escape handlers precedence over global keyboard shortcuts, clear pending shortcut timing when a menu consumes Escape, and restore focus to the dismissed control.
- Learnings consumed: [frontend/audience-freshness-cue]
