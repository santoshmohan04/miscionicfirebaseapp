# Release Checklist - Miscioni File Manager

Use this checklist before releasing any version to Google Play Store or Firebase App Distribution.

## 📋 Pre-Release Verification (2-3 Days Before)

### Code Quality
- [ ] Run `npm run lint` - All linting passes with no errors
- [ ] Run `npm test` - All unit tests pass
- [ ] Code review completed - All critical issues resolved
- [ ] No `console.log()` statements in production code
- [ ] No hardcoded API keys or secrets in code
- [ ] Firebase configuration properly set up

### Documentation
- [ ] Update CHANGELOG.md with release notes
- [ ] Update README.md if features changed
- [ ] Document any new permissions required
- [ ] Update known issues section if applicable

### Version Management
- [ ] Update version code in `android/app/build.gradle`:
  ```gradle
  versionCode 2    // Increment by 1
  versionName "1.1"  // Semantic versioning
  ```
- [ ] Update `package.json` version if using npm versioning
- [ ] Create git tag: `git tag -a v1.1 -m "Release version 1.1"`
- [ ] Verify version code is unique (never decreases)

## 🔐 Security Checks (1 Day Before)

### Secrets & Credentials
- [ ] No API keys committed to repository
- [ ] No passwords in source code
- [ ] No private keys in source code
- [ ] `.gitignore` includes:
  - [ ] `android/app/google-services.json`
  - [ ] `*.keystore`
  - [ ] `*.jks`
  - [ ] `signing.properties`
  - [ ] `local.properties`

### Permissions Review
- [ ] Review all Android permissions in `AndroidManifest.xml`
- [ ] Ensure only necessary permissions requested
- [ ] Document why each permission is needed:
  - [ ] `INTERNET` - Firebase services, cloud communication
  - [ ] `READ_MEDIA_AUDIO/VIDEO/IMAGES` - File access (Android 13+)
  - [ ] `READ_EXTERNAL_STORAGE` - File access (Android 12 and below)
  - [ ] `WRITE_EXTERNAL_STORAGE` - File operations (Android 12 and below)
  - [ ] `MANAGE_EXTERNAL_STORAGE` - File manager functionality (Android 11+)

### Firebase Configuration
- [ ] `google-services.json` placed in `android/app/`
- [ ] Firebase project ID matches package name
- [ ] Required Firebase services enabled in console:
  - [ ] Analytics (automatic)
  - [ ] Cloud Messaging (if using push notifications)
  - [ ] Firestore or Realtime Database (if using backend)
  - [ ] Cloud Storage (if needed)

## 🏗️ Build Verification (1 Day Before)

### Development Build
```bash
npm run build:prod
npm run build:android:debug
```
- [ ] Build completes without errors
- [ ] No warnings in console output
- [ ] Resulting APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build
```bash
npm run build:android:release
```
- [ ] Build completes successfully
- [ ] Bundle size under 100MB (typical for file manager)
- [ ] Resulting APK: `android/app/build/outputs/apk/release/app-release.apk`
- [ ] APK is properly signed with release keystore

### Bundle for Play Store
```bash
npm run build:android:bundle
```
- [ ] Build completes without errors
- [ ] Resulting bundle: `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] Bundle is properly signed

### APK Verification
```bash
# Check APK signature
jarsigner -verify -verbose android/app/build/outputs/apk/release/app-release.apk

# Check APK contents
unzip -l android/app/build/outputs/apk/release/app-release.apk | head -20

# Get APK information
aapt dump badging android/app/build/outputs/apk/release/app-release.apk
```
- [ ] APK is properly signed
- [ ] APK contains all necessary files
- [ ] APK version code and name match `build.gradle`

## 📱 Device Testing (1 Day Before - Mandatory)

### Pre-Release Testing
Perform testing on multiple devices if possible:

#### Device 1: Physical Device
- [ ] Device OS: Android _____ (API level _____)
- [ ] Install APK: `adb install -r android/app/build/outputs/apk/release/app-release.apk`
- [ ] App launches without crashes
- [ ] All main features work correctly
- [ ] File operations perform as expected
- [ ] Storage permissions work
- [ ] No excessive battery drain after 5 minutes use
- [ ] No excessive memory usage (check with `adb shell dumpsys meminfo`)

#### Device 2: Emulator (if no second physical device)
- [ ] Android API 24+ emulator
- [ ] Install debug APK first for faster testing
- [ ] Smoke test all major features
- [ ] Verify no crashes in Logcat

#### Connectivity Tests
- [ ] App works with Wi-Fi connected
- [ ] App works in airplane mode
- [ ] App recovers when WiFi disconnected/reconnected
- [ ] Firebase services initialize correctly

#### Performance Tests
- [ ] App launches in under 5 seconds
- [ ] File browser scrolls smoothly
- [ ] No ANRs (Application Not Responding) errors
- [ ] Memory stable (no leaks after 10 minutes)

#### Orientation & UI Tests
- [ ] Portrait orientation works
- [ ] Landscape orientation works
- [ ] Screen rotation handled correctly
- [ ] Dark mode (if implemented) works
- [ ] Light mode works
- [ ] All text readable and properly formatted

### Monitor for Crashes
```bash
# Clear previous logs
adb logcat -c

# Install and run app
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.miscioni.filemanager/.MainActivity

# Monitor logs for 5 minutes
adb logcat | grep -i "miscioni\|crash\|exception\|error"
```
- [ ] No crashes in first 5 minutes of use
- [ ] No permission errors
- [ ] No Firebase initialization errors

## 🚀 Release Day Checklist

### Final Checks
- [ ] All team members approved release
- [ ] Release notes prepared and finalized
- [ ] Marketing/communications notified
- [ ] Change log entry created

### Firebase App Distribution (Testing Release)
```bash
npm run build:android:release

firebase appdistribution:distribute \
  android/app/build/outputs/apk/release/app-release.apk \
  --app=com.miscioni.filemanager \
  --release-notes="Version 1.1: Bug fixes and performance improvements" \
  --test-groups="internal-testers"
```
- [ ] APK uploaded successfully
- [ ] Testers received notification emails
- [ ] Testers can download and install
- [ ] No crashes reported by testers within 24 hours

### Google Play Store - Internal Testing
1. Go to [Google Play Console](https://play.google.com/console)
2. Select "Miscioni File Manager"
3. Navigate to **Testing** → **Internal testing**

- [ ] Upload `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] App bundle successfully uploaded
- [ ] Add release notes describing changes
- [ ] Review app content rating questionnaire (if new app)
- [ ] Invite internal testers (team members)
- [ ] Internal testers can install and test

### Google Play Store - Closed Testing (Beta)
After internal testing passes:

- [ ] Create new release in **Closed testing** track
- [ ] Upload same `.aab` file
- [ ] Add beta release notes with "BETA" prefix
- [ ] Set percentage: Start with 10-25% of users
- [ ] Monitor crash rates (should be < 1%)
- [ ] Increase rollout gradually (50% → 100%)

### Google Play Store - Production Release
Once beta is stable (< 1% crash rate, 1,000+ installs):

- [ ] Create new release in **Production** track
- [ ] Upload final `.aab` file
- [ ] Add final release notes (user-facing)
- [ ] Set rollout percentage:
  - [ ] Start with 10% for 1 day
  - [ ] Increase to 50% for 1 day
  - [ ] Roll out to 100% if stable

### Post-Release Monitoring
- [ ] Monitor Play Store for crashes (daily for 1 week)
- [ ] Check user reviews for issues
- [ ] Monitor Firebase Analytics:
  - [ ] Active users count
  - [ ] Crash reports (should be minimal)
  - [ ] Performance metrics
- [ ] Be prepared to roll back or hotfix if issues arise

## 🔍 Post-Release (1 Week After)

### Performance Monitoring
- [ ] Crash rate under 0.5%
- [ ] No major issues reported
- [ ] User engagement metrics normal
- [ ] No spike in support tickets

### User Feedback
- [ ] Respond to user reviews
- [ ] Document bug reports
- [ ] Plan hotfixes if critical issues found
- [ ] Plan next feature release

### Metrics Review
- [ ] Active daily users: _________
- [ ] Crash rate: _________%
- [ ] Average session length: _________ minutes
- [ ] Most used features identified
- [ ] Performance issues identified (if any)

## 📝 Documentation & Records

### Keep Records Of:
- [ ] Release date and time
- [ ] Version code and version name
- [ ] Bundle/APK file sizes
- [ ] Build command used
- [ ] Key metrics at release time
- [ ] Any issues encountered
- [ ] Rollback plan if needed

### Create Release Notes Template
```markdown
## Version 1.1 - Release Date: YYYY-MM-DD

### New Features
- Feature A description
- Feature B description

### Bug Fixes
- Fixed issue with file browsing
- Fixed permission handling

### Performance Improvements
- Reduced memory usage
- Faster startup time

### Known Issues
- None

### Minimum Requirements
- Android 7.0 (API 24) or higher
```

## 🚨 Rollback Plan

If critical issues are discovered post-release:

```bash
# Option 1: Pause rollout in Play Store
# Go to Production track → Manage rollout → Pause

# Option 2: Create hotfix release
git checkout main
git pull origin main
# Fix critical issue
npm run build:android:bundle
# Re-upload to Play Store with higher version code

# Option 3: Roll back to previous version
git checkout v1.0-tag
npm run build:android:bundle
# Upload as rollback release
```

## ✅ Final Approval

Before hitting "Release":

- [ ] Project Lead: _____________ Date: _______
- [ ] QA Tester: _____________ Date: _______
- [ ] Security Review: _____________ Date: _______
- [ ] Product Owner: _____________ Date: _______

---

**Release Completed**: ________________ Date: _______

**Notes**: 
```
[Space for any notes or issues during release]
```

---

For questions or issues, refer to:
- [FIREBASE_APK_BUILD.md](./FIREBASE_APK_BUILD.md) - Detailed build guide
- [KEYSTORE_SETUP.md](./KEYSTORE_SETUP.md) - Keystore management
- [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) - Project architecture
