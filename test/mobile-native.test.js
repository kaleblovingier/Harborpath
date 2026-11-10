import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  isHapticsSupported,
  hapticPulse,
  hapticPattern,
  hapticCancel,
  hapticOverdoseBeat,
} from '../public/js/components/haptics.js';

test('Mobile Web Manifest contains valid PWA shortcuts, categories, and orientation', () => {
  const manifestPath = path.resolve('public/manifest.webmanifest');
  assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest exists');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.equal(manifest.name, 'HarborPath');
  assert.equal(manifest.short_name, 'HarborPath');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'any');
  assert.ok(Array.isArray(manifest.categories));
  assert.ok(manifest.categories.includes('health'));
  assert.ok(manifest.categories.includes('medical'));

  assert.ok(Array.isArray(manifest.shortcuts), 'Manifest has shortcuts');
  assert.ok(manifest.shortcuts.length >= 4, 'At least 4 mobile shortcuts');

  const shortcutUrls = manifest.shortcuts.map((s) => s.url);
  assert.ok(shortcutUrls.includes('/#/overdose'), 'Overdose emergency shortcut present');
  assert.ok(shortcutUrls.includes('/#/crisis'), '988 Crisis hotline shortcut present');
  assert.ok(shortcutUrls.includes('/#/match'), 'Care match shortcut present');
  assert.ok(shortcutUrls.includes('/#/tools'), 'Tools directory shortcut present');
});

test('public/index.html includes viewport-fit=cover and iOS standalone meta tags', () => {
  const html = fs.readFileSync(path.resolve('public/index.html'), 'utf8');

  assert.match(html, /viewport-fit=cover/, 'Viewport must include viewport-fit=cover for notch/safe area');
  assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes">/);
  assert.match(html, /<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="HarborPath">/);
  assert.match(html, /<meta name="format-detection" content="telephone=no">/);
  assert.match(html, /<link rel="apple-touch-icon" href="\/favicon\.svg">/);
});

test('public/styles.css implements safe-area-inset variables for iOS and Android', () => {
  const css = fs.readFileSync(path.resolve('public/styles.css'), 'utf8');

  assert.match(css, /--sat:\s*env\(safe-area-inset-top/);
  assert.match(css, /--sab:\s*env\(safe-area-inset-bottom/);
  assert.match(css, /--sal:\s*env\(safe-area-inset-left/);
  assert.match(css, /--sar:\s*env\(safe-area-inset-right/);
  assert.match(css, /\.safety-bar\s*\{[^}]*padding-top:\s*var\(--sat\)/);
  assert.match(css, /\.site-footer\s*\{[^}]*var\(--sab\)/);
});

test('haptics.js degrades gracefully in headless Node and functions with vibration mock', () => {
  // 1. Headless environment without navigator.vibrate
  assert.equal(isHapticsSupported(), false);
  assert.equal(hapticPulse(50), false);
  assert.equal(hapticPattern([50, 50]), false);
  assert.equal(hapticCancel(), false);
  assert.equal(hapticOverdoseBeat(), false);

  // 2. Node 20 does not define global navigator; newer Node versions may.
  // Restore the original global descriptor even when an assertion throws.
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const calls = [];
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { vibrate(pattern) { calls.push(pattern); return true; } },
  });
  try {
    assert.equal(isHapticsSupported(), true);
    assert.equal(hapticPulse(75), true);
    assert.equal(calls[0], 75);

    assert.equal(hapticPattern([100, 50, 100]), true);
    assert.deepEqual(calls[1], [100, 50, 100]);

    assert.equal(hapticOverdoseBeat(), true);
    assert.deepEqual(calls[2], [50, 70, 50]);

    assert.equal(hapticCancel(), true);
    assert.equal(calls[3], 0);
  } finally {
    if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
    else delete globalThis.navigator;
  }
});

test('capacitor.config.json defines secure appId and points to public webDir', () => {
  const configPath = path.resolve('capacitor.config.json');
  assert.ok(fs.existsSync(configPath), 'capacitor.config.json exists');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  assert.equal(config.appId, 'org.harborpath.app');
  assert.equal(config.appName, 'HarborPath');
  assert.equal(config.webDir, 'public');
  assert.equal(config.server?.androidScheme, 'https');
});

test('Android native scaffolding enforces strict privacy and emergency shortcuts', () => {
  const manifestXml = fs.readFileSync(path.resolve('android/app/src/main/AndroidManifest.xml'), 'utf8');

  assert.match(manifestXml, /package="org\.harborpath\.app"|android:name="\.MainActivity"/);
  assert.match(manifestXml, /android\.permission\.INTERNET/);
  assert.match(manifestXml, /android\.permission\.VIBRATE/);

  // Privacy checks: ZERO location or storage tracking permissions
  assert.ok(!manifestXml.includes('ACCESS_FINE_LOCATION'), 'Must not request fine location');
  assert.ok(!manifestXml.includes('ACCESS_COARSE_LOCATION'), 'Must not request coarse location');
  assert.ok(!manifestXml.includes('READ_EXTERNAL_STORAGE'), 'Must not request storage');
  assert.ok(!manifestXml.includes('CAMERA'), 'Must not request camera');

  const shortcutsXml = fs.readFileSync(path.resolve('android/app/src/main/res/xml/shortcuts.xml'), 'utf8');
  assert.ok(shortcutsXml.includes('#/overdose'), 'Android shortcut links to overdose emergency');
  assert.ok(shortcutsXml.includes('#/crisis'), 'Android shortcut links to 988 crisis');
});

test('iOS native scaffolding enforces Apple privacy manifest and emergency 3D touch actions', () => {
  const infoPlist = fs.readFileSync(path.resolve('ios/App/App/Info.plist'), 'utf8');

  assert.match(infoPlist, /<string>org\.harborpath\.app<\/string>/);
  assert.match(infoPlist, /<string>HarborPath<\/string>/);
  assert.match(infoPlist, /<string>org\.harborpath\.app\.overdose<\/string>/);
  assert.match(infoPlist, /<string>org\.harborpath\.app\.crisis<\/string>/);
  assert.match(infoPlist, /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/);

  // Apple Privacy Manifest (mandatory in 2024+)
  const privacyPlist = fs.readFileSync(path.resolve('ios/App/App/PrivacyInfo.xcprivacy'), 'utf8');
  assert.match(privacyPlist, /<key>NSPrivacyTracking<\/key>\s*<false\/>/);
  assert.match(privacyPlist, /<key>NSPrivacyCollectedDataTypes<\/key>\s*<array\/>/);
});
