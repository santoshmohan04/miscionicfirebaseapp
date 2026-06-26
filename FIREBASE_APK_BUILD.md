# Firebase APK Generation Guide - Miscioni File Manager

This document provides comprehensive instructions for building and releasing the Miscioni File Manager APK for Android through Firebase.

## 📋 Overview

The app is configured for:
- **Package Name**: `com.miscioni.filemanager`
- **App Name**: Miscioni File Manager
- **Build System**: Gradle with Capacitor
- **Firebase Integration**: Enabled for Analytics, App Distribution, and Cloud Services

## 🚀 Quick Start

### Prerequisites

1. **Node.js & npm**: v16+ (verify with `node --version`)
2. **Android SDK**: API 33+ installed
3. **Java**: Version 21 (configured in build.gradle)
4. **Firebase CLI**: `npm install -g firebase-tools`
5. **Capacitor CLI**: `npm install -g @capacitor/cli`
6. **Firebase Project**: Created at [Firebase Console](https://console.firebase.google.com)

### Step 1: Configure Google Services

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select or create your project: `com.miscioni.filemanager`
3. Go to **Project Settings** → **Your Apps**
4. Click **Add App** and select **Android**
5. Enter package name: `com.miscioni.filemanager`
6. Enter app nickname: `Miscioni File Manager`
7. Download `google-services.json`
8. Place the file at: `android/app/google-services.json`

**⚠️ Security Note**: This file contains sensitive credentials. Never commit it to public repositories.

```bash
# The file is already in .gitignore for safety
cat .gitignore | grep google-services.json
```

### Step 2: Generate Signing Keystore

A keystore file is required to sign release builds. Create it using:

```bash
# Generate keystore (one-time setup)
# Replace KEYSTORE_PASSWORD with a strong password
keytool -genkey -v -keystore miscioni-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias miscioni-key \
  -keypass KEYSTORE_ALIAS_PASSWORD \
  -storepass KEYSTORE_PASSWORD

# Move keystore outside the repository (for security)
mv miscioni-release.keystore ~/miscioni-keys/

# Verify the keystore
keytool -list -v -keystore ~/miscioni-keys/miscioni-release.keystore
```

**Details to save securely:**
- **Keystore Path**: `~/miscioni-keys/miscioni-release.keystore`
- **Keystore Password**: KEYSTORE_PASSWORD
- **Key Alias**: `miscioni-key`
- **Key Password**: KEYSTORE_ALIAS_PASSWORD

See [KEYSTORE_SETUP.md](./KEYSTORE_SETUP.md) for detailed instructions.

### Step 3: Install Dependencies

```bash
# Install all npm dependencies
npm install

# Sync Capacitor Android project
npx cap sync android
```

### Step 4: Configure Release Signing

Edit `android/app/build.gradle` and configure signing with environment variables:

```bash
# Set environment variables (Linux/Mac)
export KEYSTORE_PATH="$HOME/miscioni-keys/miscioni-release.keystore"
export KEYSTORE_PASSWORD="your_keystore_password"
export KEYSTORE_ALIAS="miscioni-key"
export KEYSTORE_ALIAS_PASSWORD="your_key_password"

# Windows (PowerShell)
$env:KEYSTORE_PATH = "$env:USERPROFILE\miscioni-keys\miscioni-release.keystore"
$env:KEYSTORE_PASSWORD = "your_keystore_password"
$env:KEYSTORE_ALIAS = "miscioni-key"
$env:KEYSTORE_ALIAS_PASSWORD = "your_key_password"
```

Alternatively, create `android/signing.properties` (add to .gitignore):

```properties
storeFile=~/miscioni-keys/miscioni-release.keystore
storePassword=KEYSTORE_PASSWORD
keyAlias=miscioni-key
keyPassword=KEYSTORE_ALIAS_PASSWORD
```

Then update `android/app/build.gradle` to read from this file:

```gradle
signingConfigs {
    release {
        def signingFile = rootProject.file("signing.properties")
        if (signingFile.exists()) {
            def signingProps = new Properties()
            signingProps.load(new FileInputStream(signingFile))
            storeFile = file(signingProps['storeFile'])
            storePassword = signingProps['storePassword']
            keyAlias = signingProps['keyAlias']
            keyPassword = signingProps['keyPassword']
        }
    }
}
```

## 🔨 Build Commands

### Development Build (Unsigned APK)
```bash
npm run build:android:debug
# Outputs: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release Build (Signed APK)
```bash
npm run build:android:release
# Outputs: android/app/build/outputs/apk/release/app-release.apk
```

### Android App Bundle (for Play Store)
```bash
npm run build:android:bundle
# Outputs: android/app/build/outputs/bundle/release/app-release.aab
```

## 🧪 Testing

### Test on Local Device/Emulator

```bash
# List connected devices
adb devices

# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep "miscioni"

# Run the app
adb shell am start -n com.miscioni.filemanager/.MainActivity
```

### Verify APK Signature

```bash
# Check release APK signature
jarsigner -verify -verbose android/app/build/outputs/apk/release/app-release.apk
```

## 🚀 Firebase App Distribution

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Upload to Firebase App Distribution

```bash
# Upload release APK to testers
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
  --app=com.miscioni.filemanager \
  --release-notes="Bug fixes and performance improvements" \
  --test-groups="internal-testers"

# Or use the App Distribution console at:
# https://console.firebase.google.com/project/YOUR_PROJECT/appdistribution
```

### Step 3: Manage Testers

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **App Distribution** (Engage section)
4. Add tester email addresses to **Test Groups**
5. Testers will receive invite links via email

## 📱 Google Play Store Deployment

### Prerequisites

1. **Google Play Developer Account**: $25 one-time fee at [play.google.com/console](https://play.google.com/console)
2. **App Bundle (.aab)**: Generated using `npm run build:android:bundle`
3. **Signed with release keystore**: Required for Play Store

### Deployment Steps

1. **Create App in Play Console**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app with name "Miscioni File Manager"
   - Package name: `com.miscioni.filemanager`

2. **Generate Release Bundle**:
   ```bash
   npm run build:android:bundle
   ```

3. **Upload to Play Console**:
   - Go to **Internal Testing** (or **Closed Testing** → **Staging**)
   - Upload the `.aab` file
   - Review app content, privacy policy, etc.
   - Submit for review

4. **Manage Release**:
   - Track progress in Play Console
   - Manage staged rollout percentages
   - Monitor crashes and ANRs
   - Update release notes

## 🔄 Version Management

Update version before each release:

```bash
# In android/app/build.gradle:
versionCode 2          # Increment by 1
versionName "1.1"      # Semantic versioning (major.minor.patch)
```

**Important**: versionCode must always increase with each Play Store release.

## 📊 Firebase Analytics

Analytics is automatically integrated. Monitor your app's performance:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Analytics** dashboard
4. View metrics:
   - Active users
   - Crashes
   - Performance
   - User demographics

## 🐛 Troubleshooting

### Build Fails: "google-services.json not found"
- Place `google-services.json` in `android/app/` directory
- Run `npx cap sync android`

### APK Installation Fails: "App not installed"
- Ensure correct package name: `com.miscioni.filemanager`
- Check Android version compatibility (minSdk: 24, targetSdk: 34)
- Uninstall previous version: `adb uninstall com.miscioni.filemanager`

### Signing Error: "private key not valid"
- Verify keystore password is correct
- Check keystore file exists at specified path
- Regenerate keystore if corrupted

### Play Store Rejection: "Signature does not match"
- Ensure same keystore is used for updates
- Never create new keystore for existing apps
- Verify signing configuration in build.gradle

## 🔐 Security Best Practices

1. **Never commit sensitive files**:
   ```bash
   # Already in .gitignore:
   android/app/google-services.json
   *.keystore
   *.jks
   signing.properties
   ```

2. **Use environment variables** for CI/CD:
   ```bash
   export KEYSTORE_PASSWORD="secret"
   export GOOGLE_SERVICES_JSON="$(cat android/app/google-services.json)"
   ```

3. **Secure keystore storage**:
   - Store keystore outside repository: `~/miscioni-keys/`
   - Restrict file permissions: `chmod 600 miscioni-release.keystore`
   - Backup keystore securely

4. **Sign all releases with the same keystore**:
   - Losing the keystore means losing the ability to update the app on Play Store
   - Keep multiple backups in secure locations

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Google Play Console](https://play.google.com/console)
- [Android Build Documentation](https://developer.android.com/build)
- [Capacitor Deployment Guide](https://capacitorjs.com/docs/guides/deploying-updates)
- [Gradle Android Plugin](https://developer.android.com/build/releases/gradle-plugin)

## 📝 Additional Resources

- See [KEYSTORE_SETUP.md](./KEYSTORE_SETUP.md) for detailed keystore generation
- See [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) for pre-release verification
- Check [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) for app architecture
