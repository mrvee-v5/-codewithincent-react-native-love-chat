import React from 'react';
import { View, ViewProps } from 'react-native';

let NativeBlurView: React.ComponentType<any> | null = null;

// Try Expo Blur first (Expo Go / Expo Dev Client)
try {
  NativeBlurView = require('expo-blur').BlurView;
} catch {}

// Fallback to community blur (Bare RN)
if (!NativeBlurView) {
  try {
    NativeBlurView = require('@react-native-community/blur').BlurView;
  } catch {}
}

export const UniversalBlurView: React.FC<ViewProps & any> = (props) => {
  if (NativeBlurView) {
    return <NativeBlurView {...props} />;
  }

  // Final fallback (no blur installed)
  return <View {...props} />;
};