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

## [More Examples](https://github.com/DiscreteTom/r-compose/tree/main/examples)

## [CHANGELOG](https://github.com/DiscreteTom/r-compose/blob/main/CHANGELOG.md)
