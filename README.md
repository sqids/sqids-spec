# [Sqids](https://sqids.org) Specification

[![Github Actions](https://img.shields.io/github/actions/workflow/status/sqids/sqids/tests.yml?style=flat-square)](https://github.com/sqids/sqids/actions)

This is the main repository for Sqids specification. It is meant to be the guide for future ports of different languages.

**The code is optimized for readability and clarity**; _individual implementations should optimize for performance as needed_.

All unit tests should have matching results.

## 👩‍💻 Get started

```bash
npm install
npm test
```

The main Sqids library is in [src/index.ts](src/index.ts); unit tests are in [src/tests](src/tests).

Use the following to format & check changes:

```bash
npm run format
npm run lint
```

## 🚧 Improvements (over Hashids)

1. The user is not required to provide randomized input anymore (there's still support for custom IDs).
1. Better internal alphabet shuffling function.
1. With default alphabet - Hashids is using base 49 for encoding-only, whereas Sqids is using base 61.
1. Safer public IDs, with support for custom blocklist of words.
1. Separators are no longer limited to characters "c, s, f, h, u, i, t". Instead, it's one rotating separator assigned on the fly.
1. Simpler & smaller implementation: only "encode" & "decode" functions.

## 🔬 How it works

Sqids is basically a decimal to hexademical conversion, but with a few extra features. The alphabet is larger, it supports encoding several numbers into a single ID, and it makes sure generated IDs are URL-safe (no common profanity).

Here's how encoding works:

1. An `offset` index is chosen from the given input
1. Alphabet is split into two pieces using that offset and those two halfs are swapped
1. Alphabet is reversed
1. For each input number:
   1. The first character from the alphabet is reserved to be used as `separator`
   1. The rest of the alphabet is used to encode the number into an ID
   1. If this is not the last number in the input array, the `separator` character is appended
   1. The alphabet is shuffled
1. If the generated ID does not meet the `minLength` requirement:
   - The `separator` character is appended
   - If still does not meet requirement:
     - Another shuffle occurs
     - The `separator` character is again appended to the remaining id + however many characters needed to meet the requirement
1. If the blocklist function matches the generated ID:
   - `offset` index is incremented by 1, but never more than the length of the alphabet (in that case throw error)
   - Re-encode (repeat the whole procedure again)

Decoding is the same process but in reverse. A few things worth noting:

- If two separators are right next to each other within the ID, that's fine - it just means the rest of the ID are junk characters used to satisfy the `minLength` requirement
- The decoding function does not check if ID is valid/canonical, because we want blocked IDs to still be decodable (the user can check for this stuff themselves by re-encoding decoded numbers)

## 📦 How to port Sqids to another language?

Implementations of new languages are [more than welcome](https://sqids.org/faq#contribute-lang)! To start:

1. Make sure the language is not already implemented. At this point, if you see a Hashids implementation, but not a Sqids implementation: _we could use your help on converting it_.
1. The main spec is here: <https://github.com/sqids/sqids-spec/blob/main/src/index.ts>. It's ~300 lines of code and heavily commented. Comments are there for clarity, they don't have to exist in your own implementation.
1. **Fork the repository/language you'd like to implement to your own Github account.** If the repository/language does not exist under the Sqids Github account, [open a new issue](https://github.com/sqids/sqids-spec/issues) under the spec repo so we can create a blank repo first.
1. Implement the main library + unit tests + Github Actions (if applicable). You **do not need to port tests in the `internal` folder**; they are there to test the algorithm itself.
1. Add a `README.md` -- you can re-use any of the [existing ones](https://raw.githubusercontent.com/sqids/sqids-javascript/main/README.md).
1. Please use the blocklist from <https://github.com/sqids/sqids-blocklist>. It will contain the most up-to-date list. Do not copy and paste the blocklist from other implementations, as they might not be up-to-date.
1. **Create a pull request, so we can review & merge it.**
1. If the repo has no active maintainers, we'll invite you to manage it (and maybe even merge your own PR).
1. Once the library is ready, we'll update the website.

## 📋 Notes

- The reason `prefix` character is used is to randomize sequential inputs (eg: [0, 1], [0, 2], [0, 3]). Without the extra `prefix` character embedded into the ID, the output would start with the same characters.
- Internal shuffle function does not use random input. It consistently produces the same output.
- If new words are blocked (or removed from the blocklist), the `encode()` function might produce new IDs, but the `decode()` function would still work for old/blocked IDs, plus new IDs. So, there's more than one ID that can be produced for same numbers.
- FAQ section is here: <https://sqids.org/faq>

## 🍻 License

Every official Sqids library is MIT-licensed.
