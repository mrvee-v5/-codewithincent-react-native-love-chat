jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    default: {},
    View: RN.View,
    ScrollView: RN.ScrollView,
    Image: RN.Image,
    Text: RN.Text,
    // animations
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
