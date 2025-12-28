import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'miscionicfirestore',
  webDir: 'www/browser',
  plugins: {
    SafPickerPlugin: {
      packageName: 'com.mycompany.plugins.safpicker'
    }
  }
};

export default config;
