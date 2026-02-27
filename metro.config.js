const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Watch the root so Metro sees changes in ../src
config.watchFolders = [path.resolve(__dirname, '..')];

// Resolve node_modules from both example and root
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '..', 'node_modules'),
];

// Force Metro to resolve React and React Native from the example app's node_modules
// This prevents "Duplicate React" issues when the library also has devDependencies
config.resolver.extraNodeModules = {
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
  'react-native-size-matters': path.resolve(__dirname, 'node_modules/react-native-size-matters'),
};

// Ensure we resolve typescript files
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

module.exports = config;
