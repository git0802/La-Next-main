import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'learn-next',
  webDir: '.next/export',
  server: {
    androidScheme: 'https'
  }
};

export default config;
