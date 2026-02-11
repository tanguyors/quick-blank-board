import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.somagate.app',
  appName: 'SomaGate',
  webDir: 'dist',
  server: {
    // Pour le dev avec live reload, décommentez et mettez votre URL locale :
    // url: 'http://192.168.x.x:8080',
    // cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
