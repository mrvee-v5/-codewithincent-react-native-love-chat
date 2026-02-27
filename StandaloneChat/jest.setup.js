jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const RN = require('react-native');
  const AnimatedMock = {
    createAnimatedComponent: (Comp) => Comp,
  };
  return {
    default: AnimatedMock,
    View: RN.View,
    ScrollView: RN.ScrollView,
    Image: RN.Image,
    Text: RN.Text,
    FadeIn: { build: () => ({}) },
    FadeOut: { build: () => ({}) },
    ZoomIn: { build: () => ({}) },
    ZoomOut: { build: () => ({}) },
    withSpring: (v) => v,
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    useAnimatedRef: () => React.createRef(),
    runOnJS: (fn) => fn,
  };
});
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockSwipeable(props) {
    return React.createElement(View, props, props.children);
  };
});
jest.mock('react-native-root-siblings', () => {
  return function MockRootSibling() {
    return null;
  };
});

// Polyfill setImmediate for React Native InteractionManager in Jest
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}
// Make InteractionManager.runAfterInteractions work in tests
const { InteractionManager } = require('react-native');
if (InteractionManager && typeof InteractionManager.runAfterInteractions === 'function') {
  const originalRunAfterInteractions = InteractionManager.runAfterInteractions;
  InteractionManager.runAfterInteractions = (cb) => {
    const id = setTimeout(cb, 0);
    return { cancel: () => clearTimeout(id) };
  };
}
