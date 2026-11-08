import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

describe("Testing Infrastructure Sanity Suite (Phase 6.3.1)", () => {
  it("verifies vitest test runner and basic assertions execute successfully", () => {
    expect(1 + 1).toBe(2);
    expect(true).toBe(true);
  });

  it("verifies JSDOM environment provides DOM globals and manipulation", () => {
    const el = document.createElement("div");
    el.id = "test-root";
    el.innerHTML = '<span class="test-child">KAI HQ</span>';
    document.body.appendChild(el);

    const child = document.querySelector(".test-child");
    expect(child).not.toBeNull();
    expect(child?.textContent).toBe("KAI HQ");

    document.body.removeChild(el);
  });

  it("verifies React component rendering and jest-dom matchers work", () => {
    const SampleComponent: React.FC<{ label: string }> = ({ label }) => (
      <main>
        <h1>{label}</h1>
        <p>Phase 6.3 Infrastructure Active</p>
      </main>
    );

    render(<SampleComponent label="KAI HQ Systems" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("KAI HQ Systems");
  });

  it("verifies vitest-axe integration executes and evaluates DOM accessibility", async () => {
    const { container } = render(
      <main>
        <h1>Accessible Landmark Heading</h1>
        <p>Testing accessibility assertions using axe-core in JSDOM.</p>
      </main>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
