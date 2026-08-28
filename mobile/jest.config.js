module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|lucide-react-native|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-web)",
  ],
  setupFiles: ["<rootDir>/jest.native-mock.js"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect", "<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/android/", "/ios/", "/web-build/", "/dist/", "/\\.expo/"],
  moduleNameMapper: {
    "^expo$": "<rootDir>/__mocks__/expo.js",
    "^expo/(.*)$": "<rootDir>/__mocks__/expo.js",
    "^react-native/Libraries/TurboModule/TurboModuleRegistry$": "<rootDir>/__mocks__/TurboModuleRegistry.js",
    "^@/(.*)$": "<rootDir>/$1",
  },
  testEnvironment: "node",
};
