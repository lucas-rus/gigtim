// Mock expo itself so its winter runtime (installGlobal lazy-require Proxy)
// never installs and blocks requires between tests.
jest.mock("expo", () => ({ expoConfig: { extra: {} } }));

// Mock TurboModuleRegistry to return mock modules instead of throwing
// "could not be found" errors in the jest environment
jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => ({
  getEnforcing: (name) => ({
    getConstants: () => ({
      forceTouchAvailable: false,
      interfaceDirection: 0,
      isRTL: false,
      semanticColorHash: "",
      domainName: "",
      domainIdentifier: "",
    }),
    getTheme: () => null,
  }),
  get: (name) => ({
    getConstants: () => ({}),
    getTheme: () => null,
  }),
}));

// Mock Dimensions to avoid "Cannot read properties of undefined (reading 'screen')"
jest.mock("react-native/Libraries/Utilities/Dimensions", () => ({
  get: jest.fn(() => ({ width: 375, height: 812, scale: 1, fontScale: 1 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  set: jest.fn(),
}));

// Mock PixelRatio to avoid dependency on Dimensions
jest.mock("react-native/Libraries/Utilities/PixelRatio", () => ({
  get: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size),
  roundToNearestPixel: jest.fn((size) => size),
  start: jest.fn(),
}));

// Pre-seed the web globals that expo's winter runtime would otherwise install
// lazily (accessing the lazy versions triggers a require that jest blocks
// "between tests"). Node >= 18 ships these as real globals; re-assigning here
// overwrites any lazy getter expo's preset setup may have installed.
globalThis.URL = globalThis.URL || require("url").URL;
globalThis.URLSearchParams = globalThis.URLSearchParams || require("url").URLSearchParams;
globalThis.TextEncoder = globalThis.TextEncoder || require("util").TextEncoder;
globalThis.TextDecoder = globalThis.TextDecoder || require("util").TextDecoder;
if (typeof structuredClone === "function") globalThis.structuredClone = structuredClone;

// Mock expo-secure-store so supabase client doesn't touch the keychain in tests.
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-constants so lib/supabase.ts reads test creds.
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "test-anon-key",
    },
  },
}));

// Mock expo-font + the @expo-google-fonts packages so importing the design
// barrel (which loads fonts.ts) doesn't pull in expo's winter runtime.
jest.mock("expo-font", () => ({ useFonts: () => [true, null] }));
jest.mock("@expo-google-fonts/sora", () => ({
  Sora_400Regular: {},
  Sora_500Medium: {},
  Sora_600SemiBold: {},
  Sora_700Bold: {},
}));
jest.mock("@expo-google-fonts/inter", () => ({
  Inter_400Regular: {},
  Inter_500Medium: {},
  Inter_600SemiBold: {},
  Inter_700Bold: {},
}));
jest.mock("@expo-google-fonts/jetbrains-mono", () => ({
  JetBrainsMono_400Regular: {},
  JetBrainsMono_500Medium: {},
}));

// Mock react-native-reanimated's useReducedMotion so Skeleton/Button compile.
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-svg so lucide icons render as plain elements in node tests.
jest.mock("react-native-svg", () => {
  const React = require("react");
  const mock = (name) => ({ children }) =>
    React.createElement("svg", { "aria-label": name, role: "img" }, children);
  return {
    Svg: mock("Svg"),
    Path: mock("Path"),
    Circle: mock("Circle"),
    Rect: mock("Rect"),
    Line: mock("Line"),
    Polyline: mock("Polyline"),
    Polygon: mock("Polygon"),
    Ellipse: mock("Ellipse"),
    G: mock("G"),
    Defs: mock("Defs"),
    Use: mock("Use"),
    LinearGradient: mock("LinearGradient"),
    RadialGradient: mock("RadialGradient"),
    Stop: mock("Stop"),
  };
});

// Silence console.warn from animated drivers in tests.
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    const msg = args.join(" ");
    if (msg.includes("Animated") || msg.includes("useNativeDriver")) return;
    originalWarn(...args);
  };
});
afterAll(() => {
  console.warn = originalWarn;
});
