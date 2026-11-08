import "vitest";
import "@testing-library/jest-dom/vitest";
import * as matchers from "vitest-axe/matchers";
import "vitest-axe/extend-expect";
import type { AxeMatchers } from "vitest-axe/matchers";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Augment Vitest 5 Matchers interface with AxeMatchers
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Matchers<R, T> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(matchers);

// Mock HTMLCanvasElement.prototype.getContext for JSDOM axe-core evaluations
if (typeof window !== "undefined" && typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}

afterEach(() => {
  cleanup();
});
