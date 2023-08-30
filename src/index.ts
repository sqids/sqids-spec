import defaultBlocklist from './blocklist.json';

type SqidsOptions = {
	alphabet?: string;
	minLength?: number;
	blocklist?: Set<string>;
};

export const defaultOptions = {
	// url-safe characters
	alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
	// `minLength` is the minimum length IDs should be
	minLength: 0,
	// a list of words that should not appear anywhere in the IDs
	blocklist: new Set<string>()
};

export default class Sqids {
	private alphabet: string;
	private minLength: number;
	private blocklist: Set<string>;

	constructor(options?: SqidsOptions) {
		const alphabet = options?.alphabet ?? defaultOptions.alphabet;
		const minLength = options?.minLength ?? defaultOptions.minLength;
		const blocklist = options?.blocklist ?? new Set<string>(defaultBlocklist);

		// check the length of the alphabet
		if (alphabet.length < 5) {
			throw new Error('Alphabet length must be at least 5');
		}

		// check that the alphabet has only unique characters
		if (new Set(alphabet).size != alphabet.length) {
			throw new Error('Alphabet must contain unique characters');
		}

		// test min length (type [might be lang-specific] + min length + max length)
		if (
			typeof minLength != 'number' ||
			minLength < this.minValue() ||
			minLength > alphabet.length
		) {
			throw new TypeError(
				`Minimum length has to be between ${this.minValue()} and ${alphabet.length}`
			);
		}

		// clean up blocklist:
		// 1. all blocklist words should be lowercase
		// 2. no words less than 3 chars
		// 3. if some words contain chars that are not in the alphabet, remove those
		const filteredBlocklist = new Set<string>();
		const alphabetChars = alphabet.toLowerCase().split('');
		for (const word of blocklist) {
			if (word.length >= 3) {
				const wordLowercased = word.toLowerCase();
				const wordChars = wordLowercased.split('');
				const intersection = wordChars.filter((c) => alphabetChars.includes(c));
				if (intersection.length == wordChars.length) {
					filteredBlocklist.add(wordLowercased);
				}
			}
		}

		this.alphabet = this.shuffle(alphabet);
		this.minLength = minLength;
		this.blocklist = filteredBlocklist;
	}

	/**
	 * Encodes an array of unsigned integers into an ID
	 *
	 * These are the cases where encoding might fail:
	 * - One of the numbers passed is smaller than `minValue()` or greater than `maxValue()`
	 * - A partition number is incremented so much that it becomes greater than `maxValue()`
	 *
	 * @param {array.<number>} numbers Non-negative integers to encode into an ID
	 * @returns {string} Generated ID
	 */
	encode(numbers: number[]): string {
		// if no numbers passed, return an empty string
		if (numbers.length == 0) {
			return '';
		}

		// don't allow out-of-range numbers [might be lang-specific]
		const inRangeNumbers = numbers.filter((n) => n >= this.minValue() && n <= this.maxValue());
		if (inRangeNumbers.length != numbers.length) {
			throw new Error(
				`Encoding supports numbers between ${this.minValue()} and ${this.maxValue()}`
			);
		}

		return this.encodeNumbers(numbers, false);
	}

	/**
	 * Internal function that encodes an array of unsigned integers into an ID
	 *
	 * @param {array.<number>} numbers Non-negative integers to encode into an ID
	 * @param {boolean} partitioned If true, the first number is always a throwaway number (used either for blocklist or padding)
	 * @returns {string} Generated ID
	 */
	private encodeNumbers(numbers: number[], partitioned = false): string {
		// get a semi-random offset from input numbers
		const offset =
			numbers.reduce((a, v, i) => {
				return this.alphabet[v % this.alphabet.length].codePointAt(0) + i + a;
			}, numbers.length) % this.alphabet.length;

		// re-arrange alphabet so that second-half goes in front of the first-half
		let alphabet = this.alphabet.slice(offset) + this.alphabet.slice(0, offset);

		// prefix is the first character in the generated ID, used for randomization
		const prefix = alphabet.charAt(0);

		// partition is the character used instead of the first separator to indicate that the first number in the input array is a throwaway number. this character is used only once to handle blocklist and/or padding. it's omitted completely in all other cases
		const partition = alphabet.charAt(1);

		// alphabet should not contain `prefix` or `partition` reserved characters
		alphabet = alphabet.slice(2);

		// final ID will always have the `prefix` character at the beginning
		const ret = [prefix];

		// encode input array
		for (let i = 0; i != numbers.length; i++) {
			const num = numbers[i];

			// the last character of the alphabet is going to be reserved for the `separator`
			const alphabetWithoutSeparator = alphabet.slice(0, -1);
			ret.push(this.toId(num, alphabetWithoutSeparator));

			// if not the last number
			if (i < numbers.length - 1) {
				// `separator` character is used to isolate numbers within the ID
				const separator = alphabet.slice(-1);

				// for the barrier use the `separator` unless this is the first iteration and the first number is a throwaway number - then use the `partition` character
				if (partitioned && i == 0) {
					ret.push(partition);
				} else {
					ret.push(separator);
				}

				// shuffle on every iteration
				alphabet = this.shuffle(alphabet);
			}
		}

		// join all the parts to form an ID
		let id = ret.join('');

		// if `minLength` is used and the ID is too short, add a throwaway number
		if (this.minLength > id.length) {
			// partitioning is required so we can safely throw away chunk of the ID during decoding
			if (!partitioned) {
				numbers = [0, ...numbers];
				id = this.encodeNumbers(numbers, true);
			}

			// if adding a `partition` number did not make the length meet the `minLength` requirement, then make the new id this format: `prefix` character + a slice of the alphabet to make up the missing length + the rest of the ID without the `prefix` character
			if (this.minLength > id.length) {
				id = id.slice(0, 1) + alphabet.slice(0, this.minLength - id.length) + id.slice(1);
			}
		}

		// if ID has a blocked word anywhere, add a throwaway number & start over
		if (this.isBlockedId(id)) {
			if (partitioned) {
				/* c8 ignore next 2 */
				if (numbers[0] + 1 > this.maxValue()) {
					throw new Error('Ran out of range checking against the blocklist');
				} else {
					numbers[0] += 1;
				}
			} else {
				numbers = [0, ...numbers];
			}

			id = this.encodeNumbers(numbers, true);
		}

		return id;
	}

	/**
	 * Decodes an ID back into an array of unsigned integers
	 *
	 * These are the cases where the return value might be an empty array:
	 * - Empty ID / empty string
	 * - Invalid ID passed (reserved character is in the wrong place)
	 * - Non-alphabet character is found within ID
	 *
	 * @param {string} id Encoded ID
	 * @returns {array.<number>} Array of unsigned integers
	 */
	decode(id: string): number[] {
		const ret: number[] = [];

		// if an empty string, return an empty array
		if (id == '') {
			return ret;
		}

		// if a character is not in the alphabet, return an empty array
		const alphabetChars = this.alphabet.split('');
		for (const c of id.split('')) {
			if (!alphabetChars.includes(c)) {
				return ret;
			}
		}

		// first character is always the `prefix`
		const prefix = id.charAt(0);

		// `offset` is the semi-random position that was generated during encoding
		const offset = this.alphabet.indexOf(prefix);

		// re-arrange alphabet back into it's original form
		let alphabet = this.alphabet.slice(offset) + this.alphabet.slice(0, offset);

		// `partition` character is in second position
		const partition = alphabet.charAt(1);

		// alphabet has to be without reserved `prefix` & `partition` characters
		alphabet = alphabet.slice(2);

		// now it's safe to remove the prefix character from ID, it's not needed anymore
		id = id.slice(1);

		// if this ID contains the `partition` character (between 1st position and non-last position), throw away everything to the left of it, include the `partition` character
		const partitionIndex = id.indexOf(partition);
		if (partitionIndex > 0 && partitionIndex < id.length - 1) {
			id = id.slice(partitionIndex + 1);
			alphabet = this.shuffle(alphabet);
		}

		// decode
		while (id.length) {
			const separator = alphabet.slice(-1);

			// we need the first part to the left of the separator to decode the number
			const chunks = id.split(separator);
			if (chunks.length) {
				// decode the number without using the `separator` character
				// but also check that ID can be decoded (eg: does not contain any non-alphabet characters)
				const alphabetWithoutSeparator = alphabet.slice(0, -1);
				for (const c of chunks[0]) {
					if (!alphabetWithoutSeparator.includes(c)) {
						return [];
					}
				}
				ret.push(this.toNumber(chunks[0], alphabetWithoutSeparator));

				// if this ID has multiple numbers, shuffle the alphabet because that's what encoding function did
				if (chunks.length > 1) {
					alphabet = this.shuffle(alphabet);
				}
			}

			// `id` is now going to be everything to the right of the `separator`
			id = chunks.slice(1).join(separator);
		}

		return ret;
	}

	// always zero for every language
	minValue() {
		return 0;
	}

	// depends on the programming language & implementation
	maxValue() {
		return Number.MAX_SAFE_INTEGER;
	}

	// consistent shuffle (always produces the same result given the input)
	private shuffle(alphabet: string): string {
		const chars = alphabet.split('');

		for (let i = 0, j = chars.length - 1; j > 0; i++, j--) {
			const r = (i * j + chars[i].codePointAt(0) + chars[j].codePointAt(0)) % chars.length;
			[chars[i], chars[r]] = [chars[r], chars[i]];
		}

		return chars.join('');
	}

	private toId(num: number, alphabet: string): string {
		const id = [];
		const chars = alphabet.split('');

		let result = num;

		do {
			id.unshift(chars[result % chars.length]);
			result = Math.floor(result / chars.length);
		} while (result > 0);

		return id.join('');
	}

	private toNumber(id: string, alphabet: string): number {
		const chars = alphabet.split('');
		return id.split('').reduce((a, v) => a * chars.length + chars.indexOf(v), 0);
	}

	private isBlockedId(id: string): boolean {
		id = id.toLowerCase();

		for (const word of this.blocklist) {
			// no point in checking words that are longer than the ID
			if (word.length <= id.length) {
				if (id.length <= 3 || word.length <= 3) {
					// short words have to match completely; otherwise, too many matches
					if (id == word) {
						return true;
					}
				} else if (/\d/.test(word)) {
					// words with leet speak replacements are visible mostly on the ends of the ID
					if (id.startsWith(word) || id.endsWith(word)) {
						return true;
					}
				} else if (id.includes(word)) {
					// otherwise, check for blocked word anywhere in the string
					return true;
				}
			}
		}

		return false;
	}
}
