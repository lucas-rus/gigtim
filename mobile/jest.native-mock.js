// Mock NativeModules before jest-expo preset setup runs
global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
  isDisabled: true,
  renderers: { values: () => [] },
  on() {},
  off() {},
};

global.window = global;
global.window.navigator = {};

// Mock TurboModuleRegistry to return mock modules instead of throwing
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: (name) => ({
    getConstants: () => ({}),
    getTheme: () => null,
  }),
  get: (name) => ({
    getConstants: () => ({}),
    getTheme: () => null,
  }),
}), { virtual: true });