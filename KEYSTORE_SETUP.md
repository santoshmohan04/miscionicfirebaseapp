# Keystore Setup Guide

This guide explains how to generate and manage the keystore file for signing Android APKs and App Bundles.

## 📝 Overview

A keystore is a binary file containing private keys used to sign Android applications. It's essential for:
- Building release APKs
- Publishing to Google Play Store
- App updates and versioning

**⚠️ Critical**: Never lose your keystore file - you cannot publish app updates without it!

## 🔑 Generate Keystore (One-Time Setup)

### Prerequisites

- Java Development Kit (JDK) 21+ installed
- `keytool` command available in your PATH

### Step-by-Step Generation

```bash
# Create directory for keys (outside repository)
mkdir -p ~/miscioni-keys
cd ~/miscioni-keys

# Generate keystore
keytool -genkey -v -keystore miscioni-release.keystore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias miscioni-key \
  -keypass YOUR_KEY_PASSWORD \
  -storepass YOUR_KEYSTORE_PASSWORD

# You'll be prompted for:
# - Your name (e.g., "Your Name")
# - Organizational unit (e.g., "Mobile Dev")
# - Organization (e.g., "Miscioni")
# - City/Locality (e.g., "Your City")
# - State/Province (e.g., "Your State")
# - Country Code (e.g., "US")
```

### Alternative: Interactive Mode

```bash
keytool -genkey -v -keystore miscioni-release.keystore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Prompts you for all values interactively
```

### Keystore Details

| Field | Value | Notes |
|-------|-------|-------|
| File Path | `~/miscioni-keys/miscioni-release.keystore` | Store outside repo for security |
| Key Algorithm | RSA | Industry standard |
| Key Size | 2048 bits | Meets Google Play Store requirements |
| Validity | 10000 days | ~27 years validity |
| Alias | `miscioni-key` | Unique identifier for this key |
| Keystore Password | YOUR_KEYSTORE_PASSWORD | Protects entire keystore |
| Key Password | YOUR_KEY_PASSWORD | Protects individual private key |

## ✅ Verify Keystore

```bash
# List contents
keytool -list -v -keystore ~/miscioni-keys/miscioni-release.keystore

# Enter keystore password when prompted

# Expected output shows:
# - Owner: CN=Your Name, OU=...
# - SHA256: (unique fingerprint)
# - Valid from/until: dates
```

## 🔒 Secure Keystore Management

### Set Proper Permissions

```bash
# Restrict file permissions (Linux/Mac)
chmod 600 ~/miscioni-keys/miscioni-release.keystore

# Verify permissions
ls -la ~/miscioni-keys/miscioni-release.keystore
# Should show: -rw------- (600)
```

### Backup Strategy

Create secure backups:

```bash
# Create encrypted backup
tar -czf miscioni-keys-backup-$(date +%Y%m%d).tar.gz ~/miscioni-keys/

# Store in secure location:
# - Google Drive (encrypted folder)
# - LastPass Vault
# - 1Password
# - iCloud Keychain
# - Hardware security key
```

### Store Credentials Securely

Create a password manager entry:

```
App: Miscioni File Manager - Android Signing
Keystore Path: ~/miscioni-keys/miscioni-release.keystore
Keystore Password: [SAVE HERE]
Key Alias: miscioni-key
Key Password: [SAVE HERE]
Package Name: com.miscioni.filemanager
```

## 🚀 Using Keystore for Builds

### Method 1: Environment Variables

```bash
# Linux/Mac
export KEYSTORE_PATH="$HOME/miscioni-keys/miscioni-release.keystore"
export KEYSTORE_PASSWORD="your_keystore_password"
export KEYSTORE_ALIAS="miscioni-key"
export KEYSTORE_ALIAS_PASSWORD="your_key_password"

npm run build:android:release

# Windows (PowerShell)
$env:KEYSTORE_PATH = "$env:USERPROFILE\miscioni-keys\miscioni-release.keystore"
$env:KEYSTORE_PASSWORD = "your_keystore_password"
$env:KEYSTORE_ALIAS = "miscioni-key"
$env:KEYSTORE_ALIAS_PASSWORD = "your_key_password"

npm run build:android:release
```

### Method 2: Gradle Configuration

Update `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_PATH") ?: "miscioni-release.keystore")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEYSTORE_ALIAS") ?: "miscioni-key"
        keyPassword System.getenv("KEYSTORE_ALIAS_PASSWORD")
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Method 3: Properties File (Local Development)

Create `android/signing.properties` (add to `.gitignore`):

```properties
storeFile=/Users/yourname/miscioni-keys/miscioni-release.keystore
storePassword=your_keystore_password
keyAlias=miscioni-key
keyPassword=your_key_password
```

Update `android/app/build.gradle`:

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

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

## 🆘 Troubleshooting

### Error: "Keystore was tampered with, or password was incorrect"

```bash
# Verify keystore integrity
keytool -list -v -keystore ~/miscioni-keys/miscioni-release.keystore

# If corrupted, regenerate (loses this key version)
rm ~/miscioni-keys/miscioni-release.keystore
# Follow "Generate Keystore" section above
# Note: This breaks app update chain on Play Store!
```

### Error: "Alias 'miscioni-key' does not exist"

```bash
# List all aliases in keystore
keytool -list -keystore ~/miscioni-keys/miscioni-release.keystore

# Use the correct alias from the list
```

### Error: "Key password was incorrect"

```bash
# Cannot recover lost key password
# Must regenerate keystore (breaks Play Store update chain)
# Always save key password securely!
```

### Keystore File Lost or Corrupted

```bash
# Check backups
ls -la ~/backups/miscioni-keys-*.tar.gz

# Restore from backup
tar -xzf ~/backups/miscioni-keys-backup-20240101.tar.gz -C ~/

# If no backups exist:
# You can no longer publish updates for com.miscioni.filemanager
# Must create new app listing with different package name
```

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/build-release.yml`:

```yaml
name: Build Release APK

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          java-version: 21
          distribution: 'adopt'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build release APK
        env:
          KEYSTORE_PATH: ${{ secrets.KEYSTORE_PATH }}
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEYSTORE_ALIAS: ${{ secrets.KEYSTORE_ALIAS }}
          KEYSTORE_ALIAS_PASSWORD: ${{ secrets.KEYSTORE_ALIAS_PASSWORD }}
        run: npm run build:android:release
      
      - name: Upload to Firebase App Distribution
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: |
          npm install -g firebase-tools
          firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
            --app=${{ secrets.FIREBASE_APP_ID }} \
            --release-notes="Release ${{ github.ref }}"
```

### Store Secrets in GitHub

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Create new secrets:
   - `KEYSTORE_PATH`: Path to keystore in Actions runner
   - `KEYSTORE_PASSWORD`: Your keystore password
   - `KEYSTORE_ALIAS`: `miscioni-key`
   - `KEYSTORE_ALIAS_PASSWORD`: Your key password
   - `FIREBASE_TOKEN`: Firebase CLI token (get with `firebase login:ci`)
   - `FIREBASE_APP_ID`: From Firebase Console

## 📚 Additional Resources

- [Keytool Documentation](https://docs.oracle.com/en/java/javase/21/docs/specs/man/keytool.html)
- [Android Signing Documentation](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Gradle Signing Configuration](https://developer.android.com/build/publish/app-signing#config-gradle)
