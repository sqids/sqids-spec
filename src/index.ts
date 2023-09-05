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

		// alphabet cannot contain multibyte characters
		if (new Blob([alphabet]).size != alphabet.length) {
			throw new Error('Alphabet cannot contain multibyte characters');
		}

		// check the length of the alphabet
		if (alphabet.length < 3) {
			throw new Error('Alphabet length must be at least 3');
		}

		// check that the alphabet has only unique characters
		if (new Set(alphabet).size != alphabet.length) {
			throw new Error('Alphabet must contain unique characters');
		}

		// test min length (type [might be lang-specific] + min length + max length)
		if (typeof minLength != 'number' || minLength < 0 || minLength > 1_000) {
			throw new Error(`Minimum length has to be between 0 and ${1_000}`);
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
	 * - One of the numbers passed is smaller than 0 or greater than `maxValue()`
	 * - An n-number of attempts has been made to re-generated the ID, where n is alphabet length + 1
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
		const inRangeNumbers = numbers.filter((n) => n >= 0 && n <= this.maxValue());
		if (inRangeNumbers.length != numbers.length) {
			throw new Error(`Encoding supports numbers between 0 and ${this.maxValue()}`);
		}

		return this.encodeNumbers(numbers, false);
	}

	/**
	 * Internal function that encodes an array of unsigned integers into an ID
	 *
	 * @param {array.<number>} numbers Non-negative integers to encode into an ID
	 * @param {number} increment An internal number used to modify the `offset` variable in order to re-generate the ID
	 * @returns {string} Generated ID
	 */
	private encodeNumbers(numbers: number[], increment = 0): string {
		// if increment is greater than alphabet length, we've reached max attempts
		if (increment > this.alphabet.length) {
			throw new Error('Reached max attempts to re-generate the ID');
		}

		// get a semi-random offset from input numbers
		let offset =
			numbers.reduce((a, v, i) => {
				return this.alphabet[v % this.alphabet.length].codePointAt(0) + i + a;
			}, numbers.length) % this.alphabet.length;

		// if there is a non-zero `increment`, it's an internal attempt to re-generated the ID
		offset = (offset + increment) % this.alphabet.length;

		// re-arrange alphabet so that second-half goes in front of the first-half
		let alphabet = this.alphabet.slice(offset) + this.alphabet.slice(0, offset);

		// `prefix` is the first character in the generated ID, used for randomization
		const prefix = alphabet.charAt(0);

		// reverse alphabet (otherwise for [0, x] `offset` and `separator` will be the same char)
		alphabet = alphabet.split('').reverse().join('');

		// final ID will always have the `prefix` character at the beginning
		const ret = [prefix];

		// encode input array
		for (let i = 0; i != numbers.length; i++) {
			const num = numbers[i];

			// the first character of the alphabet is going to be reserved for the `separator`
			const alphabetWithoutSeparator = alphabet.slice(1);
			ret.push(this.toId(num, alphabetWithoutSeparator));

			// if not the last number
			if (i < numbers.length - 1) {
				// `separator` character is used to isolate numbers within the ID
				ret.push(alphabet.slice(0, 1));

				// shuffle on every iteration
				alphabet = this.shuffle(alphabet);
			}
		}

		// join all the parts to form an ID
		let id = ret.join('');

		// handle `minLength` requirement, if the ID is too short
		if (this.minLength > id.length) {
			// append a separator
			id += alphabet.slice(0, 1);

			// keep appending `separator` + however much alphabet is needed
			// for decoding: two separators next to each other is what tells us the rest are junk characters
			while (this.minLength - id.length > 0) {
				alphabet = this.shuffle(alphabet);
				id += alphabet.slice(0, Math.min(this.minLength - id.length, alphabet.length));
			}
		}

		// if ID has a blocked word anywhere, restart with a +1 increment
		if (this.isBlockedId(id)) {
			id = this.encodeNumbers(numbers, increment + 1);
		}

		return id;
	}

	/**
	 * Decodes an ID back into an array of unsigned integers
	 *
	 * These are the cases where the return value might be an empty array:
	 * - Empty ID / empty string
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

		// reverse alphabet
		alphabet = alphabet.split('').reverse().join('');

		// now it's safe to remove the prefix character from ID, it's not needed anymore
		id = id.slice(1);

		// decode
		while (id.length) {
			const separator = alphabet.slice(0, 1);

			// we need the first part to the left of the separator to decode the number
			const chunks = id.split(separator);
			if (chunks.length) {
				// if chunk is empty, we are done (the rest are junk characters)
				if (chunks[0] == '') {
					return ret;
				}

				// decode the number without using the `separator` character
				const alphabetWithoutSeparator = alphabet.slice(1);
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

	private maxValue() {
		return Number.MAX_SAFE_INTEGER;
	}
}
