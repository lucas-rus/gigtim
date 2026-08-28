import { lightTokens, darkTokens, radius, font, fontSize, spacing, dawnGradient } from "@/src/design/tokens";

describe("Zori tokens", () => {
  it("exports light + dark token sets with ember primary colors", () => {
    expect(lightTokens.primary).toBe("#E14D28");
    expect(darkTokens.primary).toBe("#FD6844");
    expect(lightTokens.primaryStrong).toBe("#C83406");
    expect(darkTokens.primaryStrong).toBe("#FD6844");
  });

  it("sage secondary is AA-compliant in both modes", () => {
    expect(lightTokens.secondary).toBe("#33854A");
    expect(lightTokens.secondaryStrong).toBe("#067132");
    expect(darkTokens.secondary).toBe("#5BBD74");
  });

  it("saffron accent is identical in light and dark", () => {
    expect(lightTokens.accent).toBe("#F7B83D");
    expect(darkTokens.accent).toBe("#F7B83D");
  });

  it("linen background (light) and espresso (dark) are warm, not cold blue", () => {
    expect(lightTokens.background).toBe("#FFFBF6");
    expect(darkTokens.background).toBe("#120C09");
  });

  it("radius scale uses Zori base (md=10, lg=12, xl=16, 4xl=40)", () => {
    expect(radius.md).toBe(10);
    expect(radius.lg).toBe(12);
    expect(radius.xl).toBe(16);
    expect(radius["4xl"]).toBe(40);
    expect(radius.full).toBe(9999);
  });

  it("font families map to Sora/Inter/JetBrainsMono", () => {
    expect(font.heading).toBe("Sora");
    expect(font.sans).toBe("Inter");
    expect(font.mono).toBe("JetBrainsMono");
  });

  it("fontSize + spacing scales are defined", () => {
    expect(fontSize.base).toBe(15);
    expect(fontSize.lg).toBe(18);
    expect(spacing.lg).toBe(16);
    expect(spacing.xl).toBe(24);
  });

  it("dawn gradient stops are ember → saffron → sage", () => {
    expect(dawnGradient.light.colors[0]).toBe("#E14D28");
    expect(dawnGradient.light.colors[1]).toBe("#F7B83D");
    expect(dawnGradient.light.colors[2]).toBe("#33854A");
    expect(dawnGradient.dark.colors[0]).toBe("#FD6844");
    expect(dawnGradient.dark.colors[2]).toBe("#5BBD74");
  });
});
