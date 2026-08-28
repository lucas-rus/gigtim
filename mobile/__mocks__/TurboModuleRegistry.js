module.exports = {
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
};
