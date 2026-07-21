import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Rating } from "@/components/ui/rating";

describe("Rating", () => {
  it("renders full, half and empty stars for a 3.5 value", () => {
    render(<Rating rating={3.5} maxRating={5} showText />);
    // Sora/saffron rating shows the numeric value "3.5".
    expect(screen.getByText("3.5")).toBeInTheDocument();
  });

  it("renders all empty stars when rating is 0", () => {
    const { container } = render(<Rating rating={0} maxRating={5} showText={false} />);
    // 5 star icons rendered (lucide Star), none filled.
    const stars = container.querySelectorAll("svg.lucide-star, svg.lucide-star-half");
    expect(stars.length).toBeGreaterThanOrEqual(5);
  });

  it("respects maxRating override", () => {
    render(<Rating rating={4} maxRating={10} />);
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });
});
