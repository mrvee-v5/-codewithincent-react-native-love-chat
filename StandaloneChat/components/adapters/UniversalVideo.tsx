type EngineType = 'expo-video' | 'rn-video' | 'none';

let ExpoVideo: any = null;
let RNVideo: any = null;

try {
  ExpoVideo = require('expo-video');
} catch {}

if (!ExpoVideo) {
  try {
    RNVideo = require('react-native-video').default;
  } catch {}
}

export interface VideoEngineType {
  type: EngineType;
  ExpoVideo: any;
  RNVideo: any;
}

export const VideoEngine: VideoEngineType = {
  type: ExpoVideo ? 'expo-video' : RNVideo ? 'rn-video' : 'none',
  ExpoVideo,
  RNVideo,
};