import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miscioni.filemanager',
  appName: 'Miscioni File Manager',
  webDir: 'www/browser',
  plugins: {
    SafPickerPlugin: {
      packageName: 'com.miscioni.filemanager.plugins.safpicker'
    }
  }
};

export default config;
