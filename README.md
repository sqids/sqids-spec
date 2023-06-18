# [Sqids](https://sqids.org) Specification

[![Github Actions](https://img.shields.io/github/actions/workflow/status/sqids/sqids/tests.yml?style=flat-square)](https://github.com/sqids/sqids/actions)

This is the main repository for Sqids specification. It is meant to be the guide for future ports of different languages.

TypeScript was chosen to act as pseudocode. Individual implementations should feel free to optimize as needed. All the unit tests should have matching results.

## 👩‍💻 Get started

```bash
npm install
npm test
```

The main Sqids library is in [./index.ts](index.ts), & unit tests are in [./index.test.ts](index.test.ts).

Use the following to format & check changes:

```bash
npm run format
npm run lint
```

## 🚧 Improvements over Hashids

1. The user is not required to provide randomized input anymore (they are however free to manually shuffle the alphabet for custom IDs).
1. Better internal alphabet shuffling function.
1. With default alphabet - Hashids is using base 49 for encoding-only, whereas Sqids is using base 60.
1. Safer public IDs, with support for custom blocklist.
1. Separators are no longer limited to characters "c, s, f, h, u, i, t". Instead they're assigned on the fly.
1. Simpler & smaller implementation: only "encode", "decode", "minValue", "maxValue" functions.

## 🔬 How it works

Sqids is basically a decimal to hexademical conversion, but with a few extra features. The alphabet is larger, it supports encoding several numbers into a single ID, and it makes sure generated IDs are URL-safe (no profanity).

Here's how encoding works:

1. A pseudo-random alphabet offset integer is chosen from the given input.
1. Alphabet is re-shuffled using that offset.
1. Two characters are reserved from that alphabet, named `prefix` and `partition` (`prefix` is always the first character of an ID; `partition` is the character that acts as a separator between junk numbers and real numbers).
1. For each input number, the following happens:
   1. Another character is reserved from the alphabet, named `separator`.
   1. The rest of the alphabet is used to encode the number into id.
   1. If this is not the last number in the input array, a separator is appended onto the id.
   1. The alphabet is shuffled.
1. If the generated ID does not meet the `minLength` requirement, the following happens:
   - The difference in length is calculated.
   - That difference is taken from the chunk of the alphabet and decoded back into a number.
   - That number is prepended into the input array as a partition number & encoding restarts.
1. If the generated ID is found to have a blocklist word within its string, the following happens:
   - If this is the first time, a partition number is prepended to the input array & encoding restarts. However, in this case, a `partition` character is used to isolate the partition number, as opposed to the `separator` character.
   - If this is not the first time (meaning the partition number has also matched the blocklist), then the partition number is incremented & encoding restarts.

Decoding is the same process but in reverse.

## 📋 Notes

- The reason "prefix" character is used is to randomize sequential inputs (eg: [0, 1], [0, 2], [0, 3]). Without the extra prefix character embedded into the ID, the output would start with the same characters.
- Internal shuffle function does not use random input. It consistently produces the same shuffle.
- The blocklist should be a list of unacceptable words. At this point it is empty in the specification. Ideally we'd maintain a repository of these words (or use an existing one), and the words would be embedded into the library (since the codebase does not import any 3rd party libs).

## 🍻 License

Every official Sqids library is MIT-licensed.
