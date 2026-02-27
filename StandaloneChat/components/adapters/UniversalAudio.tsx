// src/adapters/UniversalAudio.ts

type EngineType = 'expo-audio' | 'rnsound' | 'none';

let ExpoAudio: any = null;
let RNSound: any = null;

// Try expo-audio first
try {
  ExpoAudio = require('expo-audio');
} catch {}

// Fallback to react-native-sound
if (!ExpoAudio) {
  try {
    RNSound = require('react-native-sound');
  } catch {}
}

export interface AudioEngineType {
  type: EngineType;
  ExpoAudio: any;
  RNSound: any;
}

export const AudioEngine: AudioEngineType = {
  type: ExpoAudio ? 'expo-audio' : RNSound ? 'rnsound' : 'none',
  ExpoAudio,
  RNSound,
};