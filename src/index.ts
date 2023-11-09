/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers
 */
export type QuantifierOptions = {
  /**
   * @default true
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers
   */
  greedy?: boolean;
};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
 */
export type AssertionOptions = {
  /**
   * @default false
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
   */
  negative?: boolean;
};

function intoString(content: string | RegExp) {
  return content instanceof RegExp ? content.source : content;
}

/**
 * All the composable functions.
 */
export const composables = Object.freeze({
  /**
   * Escape regex special characters.
   * @example
   * escape("(a*b)") === "\\(a\\*b\\)"
   */
  escape(content: string): string {
    // use the `g` flag to replace all occurrences
    return content.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
  },
  /**
   * Concatenate strings.
   * Empty strings are ignored.
   * If a parameter is a `RegExp`, its source is used.
   * @example
   * concat("a", "b") === "ab"
   * concat("a", '', "b") === "ab"
   * concat('a', /\./, 'b') === "a\\.b"
   */
  concat(...contents: (string | RegExp)[]): string {
    return contents
      .map(intoString)
      .filter((c) => c.length)
      .join("");
  },
  /**
   * Match a list of candidates.
   * Empty strings are ignored.
   * If a parameter is a `RegExp`, its source is used.
   * @example
   * select("a", "b") === "a|b"
   * select("a", '', "b") === "a|b"
   * select('a', /\./, 'b') === "a|\\.|b"
   */
  select(...contents: (string | RegExp)[]) {
    return contents
      .map(intoString)
      .filter((c) => c.length)
      .join("|");
  },
  /**
   * Wrap the content by a non-capturing group.
   * If the content is a `RegExp`, its source is used.
   * @example
   * group("a") === "(?:a)"
   * group(/\./) === "(?:\\.)"
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Groups_and_backreferences
   */
  group(content: string | RegExp) {
    return `(?:${intoString(content)})`;
  },
  /**
   * Wrap the content by a capturing group.
   * If the content is a `RegExp`, its source is used.
   * @example
   * capture("a") === "(a)"
   * capture(/\./) === "(\\.)"
   * capture("a", { name: "n" }) === "(?<n>a)"
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Groups_and_backreferences
   */
  capture(
    content: string | RegExp,
    options?: {
      /**
       * Name the capturing group.
       * @default undefined
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Groups_and_backreferences
       */
      name?: string;
    },
  ) {
    return options?.name === undefined
      ? `(${intoString(content)})`
      : `(?<${options.name}>${intoString(content)})`;
  },
  /**
   * Match zero or more times (`*`).
   * If the content is a `RegExp`, its source is used.
   * @example
   * any("a") === "(?:a)*"
   * any(/\./) === "(?:\\.)*"
   * any("a", { greedy: false }) === "(?:a)*?"
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers
   */
  any(content: string | RegExp, options?: QuantifierOptions) {
    return options?.greedy ?? true
      ? `(?:${intoString(content)})*`
      : `(?:${intoString(content)})*?`;
  },
  /**
   * Match one or more times (`+`).
   * If the content is a `RegExp`, its source is used.
   * @example
   * some("a") === "(?:a)+"
   * some(/\./) === "(?:\\.)+"
   * some("a", { greedy: false }) === "(?:a)+?"
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers
   */
  some(content: string | RegExp, options?: QuantifierOptions) {
    return options?.greedy ?? true
      ? `(?:${intoString(content)})+`
      : `(?:${intoString(content)})+?`;
  },
  /**
   * Match zero or one time (`?`).
   * If the content is a `RegExp`, its source is used.
   * @example
   * optional("a") === "(?:a)?"
   * optional(/\./) === "(?:\\.)?"
   * optional("a", { greedy: false }) === "(?:a)??"
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers
   */
  optional(content: string | RegExp, options?: QuantifierOptions) {
    return options?.greedy ?? true
      ? `(?:${intoString(content)})?`
      : `(?:${intoString(content)})??`;
  },
  /**
   * If the content is a `RegExp`, its source is used.
   * @example
   * lookahead("a") === "(?=a)"
   * lookahead(/\./) === "(?=\\.)"
   * lookahead("a", { negative: true }) === "(?!a)"
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
   */
  lookahead(content: string | RegExp, options?: AssertionOptions) {
    return options?.negative ?? false
      ? `(?!${intoString(content)})`
      : `(?=${intoString(content)})`;
  },
  /**
   * If the content is a `RegExp`, its source is used.
   * @example
   * lookbehind("a") === "(?<=a)"
   * lookbehind(/\./) === "(?<=\\.)"
   * lookbehind("a", { negative: true }) === "(?<!a)"
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
   */
  lookbehind(content: string | RegExp, options?: AssertionOptions) {
    return options?.negative ?? false
      ? `(?<!${intoString(content)})`
      : `(?<=${intoString(content)})`;
  },
  /**
   * Match any character except the ones in the content.
   * If the content is a `RegExp`, its source is used.
   * @example
   * not("a") === "[^a]"
   * not(/\./) === "[^\\.]"
   */
  not(content: string | RegExp) {
    return `[^${intoString(content)}]`;
  },
  /**
   * @alias String.raw
   * @example
   * raw`\n` === "\\n"
   */
  raw: String.raw,
});

export type Composables = typeof composables;

/**
 * @example
 * compose(({ concat, group }) => concat(group("a"), group("b")), 'g') === /(?:a)(?:b)/g
 */
export function compose(
  cb: (composables: Composables) => string,
  flags?: string,
): RegExp {
  return new RegExp(cb(composables), flags);
}
