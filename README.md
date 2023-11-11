# R-Compose

[![npm](https://img.shields.io/npm/v/@discretetom/r-compose?style=flat-square)](https://www.npmjs.com/package/@discretetom/r-compose)
![coverage](https://img.shields.io/codecov/c/github/DiscreteTom/r-compose?style=flat-square)
![build](https://img.shields.io/github/actions/workflow/status/DiscreteTom/r-compose/publish.yml?style=flat-square)
![license](https://img.shields.io/github/license/DiscreteTom/r-compose?style=flat-square)

Compose `RegExp` in JavaScript in a readable and maintainable way.

## Install

```bash
yarn add @discretetom/r-compose
```

## Features

- Treat `RegExp` as its source string, and concat it with literal or escaped strings. Empty strings will be ignored.

```ts
concat(
  /\n/, // => "\\n"
  "123", // => "123"
  false ? /123/ : "", // => ignored
  escape("()"), // => "\\(\\)"
) === "\\n123\\(\\)";
```

- Auto group content in a non-capturing group if the composable function is context-sensitive.

```ts
select("a", "b") === "(?:a|b)";
optional("c") === "(?:c)?";
lookahead("d") === "(?=d)";
```

- Additional options for some composable functions.

```ts
capture("a", { name: "foo" }) === "(?<foo>a)";
optional("a", { greedy: false }) === "(?:a)??";
lookahead("a", { negative: true }) === "(?!a)";
```

- Composable functions return `string` so you can cascade / nest them.

```ts
lookahead(
  concat(
    lookbehind("[_$[:alnum:]]", { negative: true }),
    select(lookbehind(/\.\.\./), lookbehind(/\./, { negative: true })),
    optional(concat(capture(/\bexport/), /\s+/)),
    optional(concat(capture(/\bdeclare/), /\s+/)),
    concat(/\b/, capture(select("var", "let"))),
    lookahead("[_$[:alnum:]]", { negative: true }),
    select(lookahead(/\.\.\./), lookahead(/\./, { negative: true })),
  ),
);
```

## When to Use

- When to use `concat`? Should I always use `concat('a', 'b', 'c')` instead of directly `/abc/`?
  - Use `concat` when you need to concat strings with `RegExp`, since the escaped sequences in strings and in `RegExp`s are different. E.g. `concat('a', /\*/) === "a\\*"`.
  - Use `concat` if you have conditional logic, since empty strings will be ignored. E.g. `concat('a', false ? 'b' : '', 'c') === "ac"`.
- When to use those which will create groups like `select/capture/optional/lookahead`?
  - They are always recommended to use, since parentheses in TypeScript can be organized by code formatter and is more readable than in `RegExp` source string.
  - Unless the decorated content is only one character, e.g. transform `(?:ab)?` into `optional('ab')` is recommended since the parentheses can be removed, but `a?` is not since there is no parentheses.

Overall, it's your choice to use r-compose aggressively or conservatively. But you can always optimize the organization of your `RegExp` progressively.

## Example

[retsac](https://github.com/DiscreteTom/retsac) use `r-compose` to avoid escape hell and make the code more readable and maintainable.

<details>
<summary>Click to Expand</summary>

<table>
<tr><td> Before: string interpolation </td><td> After: r-compose </td></tr>
<tr>
<td>

```ts
new RegExp(
  // open quote
  `(?:${esc4regex(open)})` +
    // content, non-greedy
    `(?:${
      escape
        ? `(?:${lineContinuation ? "\\\\\\n|" : ""}\\\\.|[^\\\\${
            multiline ? "" : "\\n"
          }])` // exclude `\n` if not multiline
        : `(?:${lineContinuation ? "\\\\\\n|" : ""}.${
            multiline
              ? // if multiline, accept `\n`
                "|\\n"
              : ""
          })`
    }*?)` + // '*?' means non-greedy(lazy)
    // close quote
    `(?:${
      acceptUnclosed
        ? // if accept unclosed, accept '$'(EOF)
          // or '\n'(if not multiline)
          `(?:${esc4regex(close)})|$${multiline ? "" : "|(?=\\n)"}`
        : esc4regex(close)
    })`,
);
```

</td>
<td>

```ts
compose(({ concat, any, select, lookahead, escape, not }) =>
  concat(
    // match open quote
    escape(open),
    // match content
    any(
      escaped
        ? select(
            lineContinuation ? /\\\n/ : "", // line continuation is treated as part of the content
            /\\./, // any escaped character is treated as part of the content
            not(
              // any character except the following is treated as part of the content
              concat(
                /\\/, // standalone backslash shouldn't be treated as part of the content
                multiline ? "" : /\n/, // if not multiline, `\n` shouldn't be treated as part of the content
              ),
            ),
          )
        : select(
            lineContinuation ? /\\\n/ : "", // line continuation is treated as part of the content
            /./, // any non-newline character is treated as part of the content
            multiline ? /\n/ : "", // if multiline, `\n` should be treated as part of the content
          ),
      // since we use `/./` in the content, we need to make sure it doesn't match the close quote
      { greedy: false },
    ),
    // match close quote
    acceptUnclosed
      ? select(
          escape(close),
          "$", // unclosed string is acceptable, so EOF is acceptable
          multiline
            ? "" // if multiline is enabled, we don't treat `\n` as the close quote
            : lookahead(/\n/), // use lookahead so we don't include the `\n` in the result
        )
      : escape(close), // unclosed string is not accepted, so we only accept the close quote
  ),
);
```

</td>
</tr>
</table>

> Source: https://github.com/DiscreteTom/retsac/commit/86b7ddf4a8c008086171b8d471dd05214327bfb3?diff=split

</details>

[retsac](https://github.com/DiscreteTom/retsac) also use `r-compose` to refactor long and complex regex with confidence.

<details>
<summary>Click to Expand</summary>

### Before

```ts
enableSeparator
  ? new RegExp(
      `(?:0x[\\da-f]+|0o[0-7]+|\\d+(?:${separator}\\d+)*(?:\\.\\d+(?:${separator}\\d+)*)?(?:[eE][-+]?\\d+(?:${separator}\\d+)*)?)${
        boundary ? "\\b(?!\\.)" : "" // '.' is not allowed as the boundary
      }`,
      "i",
    )
  : new RegExp(
      `(?:0x[\\da-f]+|0o[0-7]+|\\d+(?:\\.\\d+)?(?:[eE][-+]?\\d+)?)${
        boundary ? "\\b(?!\\.)" : "" // '.' is not allowed as the boundary
      }`,
      "i",
    );
```

### After

```ts
compose(
  ({ concat, select, any, optional, lookahead }) => {
    const separatorPart = enableSeparator ? any(concat(separator, /\d+/)) : "";
    return concat(
      select(
        /0x[\da-f]+/, // hexadecimal
        /0o[0-7]+/, // octal
        // below is decimal with separator
        concat(
          /\d+/, // integer part
          separatorPart, // separator and additional integer part
          optional(concat(/\.\d+/, separatorPart)), // decimal part
          optional(concat(/[eE][-+]?\d+/, separatorPart)), // exponent part
        ),
      ),
      boundary
        ? concat(
            /\b/,
            // '.' match /\b/ but is not allowed as the boundary
            lookahead(/\./, { negative: true }),
          )
        : "",
    );
  },
  "i", // case insensitive
);
```

> Source: https://github.com/DiscreteTom/retsac/commit/430a2175eb4c6d564ebdacf5b01a91ea42885ef2?diff=split

</details>

## [More Examples](https://github.com/DiscreteTom/r-compose/tree/main/examples)

## [CHANGELOG](https://github.com/DiscreteTom/r-compose/blob/main/CHANGELOG.md)
