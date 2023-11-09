import { composables } from "../../src";

test("escape", () => {
  expect(composables.escape("(a*b)")).toBe("\\(a\\*b\\)");
});

test("concat", () => {
  expect(composables.concat("a", "b")).toBe("ab");
  expect(composables.concat("a", "", "b")).toBe("ab");
  expect(composables.concat("a", /\./, "b")).toBe("a\\.b");
});

test("select", () => {
  expect(composables.select("a", "b")).toBe("(?:a|b)");
  expect(composables.select("a", "", "b")).toBe("(?:a|b)");
  expect(composables.select("a", /\./, "b")).toBe("(?:a|\\.|b)");
});

test("group", () => {
  expect(composables.group("a")).toBe("(?:a)");
  expect(composables.group(/\./)).toBe("(?:\\.)");
});

test("capture", () => {
  expect(composables.capture("a")).toBe("(a)");
  expect(composables.capture(/\./)).toBe("(\\.)");
  expect(composables.capture("a", { name: "n" })).toBe("(?<n>a)");
});

test("any", () => {
  expect(composables.any("a")).toBe("(?:a)*");
  expect(composables.any(/\./)).toBe("(?:\\.)*");
  expect(composables.any("a", { greedy: false })).toBe("(?:a)*?");
});

test("some", () => {
  expect(composables.some("a")).toBe("(?:a)+");
  expect(composables.some(/\./)).toBe("(?:\\.)+");
  expect(composables.some("a", { greedy: false })).toBe("(?:a)+?");
});

test("optional", () => {
  expect(composables.optional("a")).toBe("(?:a)?");
  expect(composables.optional(/\./)).toBe("(?:\\.)?");
  expect(composables.optional("a", { greedy: false })).toBe("(?:a)??");
});

test("lookahead", () => {
  expect(composables.lookahead("a")).toBe("(?=a)");
  expect(composables.lookahead(/\./)).toBe("(?=\\.)");
  expect(composables.lookahead("a", { negative: true })).toBe("(?!a)");
});

test("lookbehind", () => {
  expect(composables.lookbehind("a")).toBe("(?<=a)");
  expect(composables.lookbehind(/\./)).toBe("(?<=\\.)");
  expect(composables.lookbehind("a", { negative: true })).toBe("(?<!a)");
});

test("not", () => {
  expect(composables.not("a")).toBe("[^a]");
  expect(composables.not(/\./)).toBe("[^\\.]");
});
