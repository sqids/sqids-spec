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
1. With default alphabet - Hashids is using base 49 for encoding-only, whereas Sqids is using base 60.
1. Safer public IDs, with support for custom blocklist of words.
1. Separators are no longer limited to characters "c, s, f, h, u, i, t". Instead, it's one rotating separator assigned on the fly.
1. Simpler & smaller implementation: only "encode", "decode", "minValue", "maxValue" functions.

## 🔬 How it works

Sqids is basically a decimal to hexademical conversion, but with a few extra features. The alphabet is larger, it supports encoding several numbers into a single ID, and it makes sure generated IDs are URL-safe (no common profanity).

Here's how encoding works:

1. A pseudo-random alphabet offset integer is chosen from the given input.
1. Alphabet is split into two pieces using that offset and that parts are swapped.
1. Two characters are reserved from that alphabet, named `prefix` and `partition` (`prefix` is always the first character of the generated ID; `partition` is the character that acts as a separator between throwaway number and real numbers).
1. For each input number:
   1. Another character is reserved from the alphabet, named `separator`.
   1. The rest of the alphabet is used to encode the number into an ID.
   1. If this is not the last number in the input array, either a `partition` or a `separator` character is appended (depending on the index & whether the numbers are partitioned or not).
   1. The alphabet is shuffled.
1. If the generated ID does not meet the `minLength` requirement:
   - If this is the first time, a throwaway number is prepended to the input array.
   - Number are encoded again to generate a new ID (this time partitioned).
   - If the `minLength` requirement is still not met, a new ID is composed in this way: the `prefix` character + a slice of the alphabet to make up the missing length + the rest of the ID without the `prefix` character.
1. If the blocklist function matches the generated ID:
   - If this is the first time, a throwaway number is prepended to the input array & encoding restarts (this time partitioned).
   - If the throwaway number has also matched the blocklist, then the throwaway number is incremented & encoding restarts.

Decoding is the same process but in reverse, with a few exceptions:

- Once the `partition` character is found, everything to the left of it gets thrown away.
- There is nothing done regarding `blocklist` and `minLength` requirements, those are used for encoding.

## 📦 Porting to a new language

Implementations of new languages are more than welcome! To start:

1. Make sure you have access to the org's repo. The format is `https://github.com/sqids/sqids-[LANGUAGE]`. If you don't have access, ask one of the maintainers to add you; if it doesn't exist, ask [@4kimov](https://github.com/4kimov).
1. The main spec is here: <https://github.com/sqids/sqids-spec/blob/main/src/index.ts>. It's under 400 lines of code and heavily commented. Comments are there for clarity, they don't have to exist in your own implementation.
1. Please use the blocklist from <https://github.com/sqids/sqids-blocklist> (copy and paste the output it gives you into your own code). It will contain the most up-to-date list. Do not copy and paste the blocklist from other implementations, as they might not be up-to-date.
1. Be sure to implement unit tests. We want to make sure all implementations produce the same IDs. Unit tests are here: <https://github.com/sqids/sqids-spec/tree/main/tests>.
1. If you're publishing to a package manager, please add a co-maintainer so more than one person has access.
1. When done, please let [@4kimov](https://github.com/4kimov) know so we can update the website.

## 📋 Notes

- The reason `prefix` character is used is to randomize sequential inputs (eg: [0, 1], [0, 2], [0, 3]). Without the extra `prefix` character embedded into the ID, the output would start with the same characters.
- Internal shuffle function does not use random input. It consistently produces the same output.
- If new words are blocked (or removed from the blocklist), the `encode()` function might produce new IDs, but the `decode()` function would still work for old/blocked IDs, plus new IDs. So, there's more than one ID that can be produced for same numbers.

## 🍻 License

Every official Sqids library is MIT-licensed.
