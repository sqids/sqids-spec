# [Sqids](https://sqids.org) Specification

[![Github Actions](https://img.shields.io/github/actions/workflow/status/sqids/sqids/tests.yml?style=flat-square)](https://github.com/sqids/sqids/actions)

> 🏗️ This is still a work in progress. Do not use in production.

This is the main repository for Sqids specification. It is meant to be the guide for future ports of different languages.

The code is optimized for readability; individual implementations should optimize for performance as needed. All unit tests should have matching results.

## 👩‍💻 Get started

```bash
npm install
npm test
```

The main Sqids library is in [index.ts](index.ts), & implementation unit tests are in [tests/](tests/).

Use the following to format & check changes:

```bash
npm run format
npm run lint
```

## 🚧 Improvements (over Hashids)

1. The user is not required to provide randomized input anymore (there's still support for custom IDs).
1. Better internal alphabet shuffling function.
1. With default alphabet - Hashids is using base 49 for encoding-only, whereas Sqids is using base 60.
1. Safer public IDs, with support for custom blacklist of words.
1. Separators are no longer limited to characters "c, s, f, h, u, i, t". Instead, it's one rotating separator assigned on the fly.
1. Simpler & smaller implementation: only "encode", "decode", "minValue", "maxValue" functions.

## 🔬 How it works

Sqids is basically a decimal to hexademical conversion, but with a few extra features. The alphabet is larger, it supports encoding several numbers into a single ID, and it makes sure generated IDs are URL-safe (no profanity).

Here's how encoding works:

1. A pseudo-random alphabet offset integer is chosen from the given input.
1. Alphabet is shuffled using that offset.
1. Two characters are reserved from that alphabet, named `prefix` and `partition` (`prefix` is always the first character of the generated ID; `partition` is the character that acts as a separator between throwaway number and real numbers).
1. For each input number:
   1. Another character is reserved from the alphabet, named `separator`.
   1. The rest of the alphabet is used to encode the number into an ID.
   1. If this is not the last number in the input array, a separator is appended.
   1. The alphabet is shuffled.
1. If the generated ID does not meet the `minLength` requirement:
   - The difference in length is calculated.
   - That length is taken from the alphabet and decoded back into a number.
   - That number is prepended into the input array as a throwaway number & encoding restarts (this time partitioned).
1. If the blacklist function matches the generated ID:
   - If this is the first time, a throwaway number is prepended to the input array & encoding restarts (this time partitioned). However, during encoding a `partition` character is used to isolate the throwaway number, as opposed to the `separator` character.
   - If the throwaway number has also matched the blacklist, then the throwaway number is incremented & encoding restarts.

Decoding is the same process but in reverse.

## 📋 Notes

- The reason `prefix` character is used is to randomize sequential inputs (eg: [0, 1], [0, 2], [0, 3]). Without the extra `prefix` character embedded into the ID, the output would start with the same characters.
- Internal shuffle function does not use random input. It consistently produces the same output.
- If new words are blacklisted (or removed from the blacklist), the `encode()` function might produce new IDs, but the `decode()` function would still work for old/blocked IDs, plus new IDs. So, there's more than one ID that can be produced for same numbers.

## ✅ Todos

- [x] Basic encoding/decoding functionality
- [x] Support for custom blacklist
- [x] Support for padding with `minLength`
- [x] Include unit tests for the internal shuffle function (check if shuffle can be improved)
- [x] Improve the way `offset` is generated & how alphabet is shuffled right after during encoding
- [x] Start work on the [default blacklist](https://github.com/sqids/sqids-blacklist)
- [ ] Check if can add throwaway partition to the end (not the beginning); might avoid a few extra cycles
- [ ] Add required checks under @todo's
- [ ] Define error handling behavior
- [ ] Create a universal test suite (great examples [here](https://github.com/niieani/hashids.js/tree/master/src/tests)).
- [ ] Add non-English words to the default blacklist

## 🍻 License

Every official Sqids library is MIT-licensed.
