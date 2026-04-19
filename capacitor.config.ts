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
    // 'never' = pas d'inset auto par le WebView. On gère nous-mêmes la safe area via env(safe-area-inset-*) dans le CSS.
    // 'automatic' provoquait un DOUBLE padding (WebView + CSS) qui créait un écart moche en haut du header et en bas de la nav bar.
    contentInset: 'never',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
