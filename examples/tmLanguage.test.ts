import { compose } from "../src";

// ref: https://github.com/microsoft/vscode/blob/cb9c48673f166ae72f55cf19d6f77da518244180/extensions/typescript-basics/syntaxes/TypeScript.tmLanguage.json#L298C19-L298C19

const r = compose(
  ({ concat, lookahead, lookbehind, select, optional, capture }) =>
    // the whole regex is a lookahead, no characters are consumed
    lookahead(
      concat(
        lookbehind("[_$[:alnum:]]", { negative: true }), // ensure not preceded by an alphanumeric character, underscore or a dollar sign
        select(
          lookbehind(/\.\.\./), // could be preceded by 3 dots
          lookbehind(/\./, { negative: true }), // not preceded by one dot
        ),
        // the `export` keyword is optional, ensure boundary behind, whitespace after
        optional(concat(capture(/\bexport/), /\s+/)),
        // the `declare` keyword is optional, ensure boundary behind, whitespace after
        optional(concat(capture(/\bdeclare/), /\s+/)),
        // the `var` or `let` keyword is required, ensure boundary behind
        concat(/\b/, capture(select("var", "let"))),
        // ensure not followed by an alphanumeric character, underscore or a dollar sign. e.g. `var_`
        lookahead("[_$[:alnum:]]", { negative: true }),
        // could be followed by 3 dots, but couldn't followed by one dot
        select(lookahead(/\.\.\./), lookahead(/\./, { negative: true })),
      ),
    ),
);

test("TypeScript.tmLanguage.json", () => {
  expect(r.source).toBe(
    /(?=(?<![_$[:alnum:]])(?:(?<=\.\.\.)|(?<!\.))(?:(\bexport)\s+)?(?:(\bdeclare)\s+)?\b((?:var|let))(?![_$[:alnum:]])(?:(?=\.\.\.)|(?!\.)))/
      .source,
  );
});
