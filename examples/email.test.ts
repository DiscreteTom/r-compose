import { compose } from "../src";

const r = compose(({ concat, lookahead, some }) =>
  concat(
    "^", // BOF
    lookahead(/\./, { negative: true }), // ensure the email doesn't start with a dot
    some("[a-zA-Z0-9._%+-]"), // one or more chars as the username
    "@",
    some(
      // subdomains
      concat(
        some("[a-zA-Z0-9-]"), // host
        /\./, // dot
      ),
    ),
    /[a-zA-Z]{2,}/, // TLD
    "$", // EOF
  ),
);

test("email", () => {
  expect(r.source).toBe(
    /^(?!\.)(?:[a-zA-Z0-9._%+-])+@(?:(?:[a-zA-Z0-9-])+\.)+[a-zA-Z]{2,}$/.source,
  );
});
