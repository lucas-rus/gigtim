import { render } from "@testing-library/react-native";
import { Button } from "@/src/ui/Button";

describe("Button", () => {
  it("renders its label text", () => {
    const { getByText } = render(<Button>Aplică</Button>);
    expect(getByText("Aplică")).toBeTruthy();
  });

  it("renders a custom variant without crashing", () => {
    const { getByText } = render(
      <Button variant="secondary" size="lg">Salvează</Button>
    );
    expect(getByText("Salvează")).toBeTruthy();
  });

  it("renders a spinner (not the label) when loading", () => {
    const { queryByText, toJSON } = render(<Button loading>Se încarcă</Button>);
    // Loading swaps the label for an ActivityIndicator.
    expect(queryByText("Se încarcă")).toBeNull();
    // The rendered tree contains an ActivityIndicator (busy state).
    expect(JSON.stringify(toJSON())).toContain("ActivityIndicator");
  });
});
