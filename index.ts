type SqidsOptions = {
	alphabet: string;
	minLength: number;
	blocklist: Set<string>;
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
	alphabet: string;
	minLength: number;
	blocklist: Set<string>;

	constructor(options: SqidsOptions = defaultOptions) {
		// @todo check that the alphabet has only unique characters
		// @todo check minimum length of the alphabet
		// @todo check that `minLength` >= 0 && `minLength` <= `alphabet.length`
		// @todo exclude words from `blocklist` that contain characters not in the alphabet

		this.alphabet = this.shuffle(options.alphabet ?? defaultOptions.alphabet);
		this.minLength = options.minLength ?? defaultOptions.minLength;
		this.blocklist = options.blocklist ?? defaultOptions.blocklist;
	}

	/**
	 * Encodes an array of unsigned integers into an ID
	 *
	 * @param {array.<number>} numbers Positive integers to encode into an ID
	 * @returns {string} Generated ID
	 */
	encode(numbers: number[]): string {
		// @todo check that no negative numbers
		// @todo check that numbers are not greater than `this.maxValue()`

		return this.encodeNumbers(numbers, false);
	}

	/**
	 * Internal function that encodes an array of unsigned integers into an ID
	 *
	 * @param {array.<number>} numbers Positive integers to encode into an ID
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

		// partition is the character used instead of the first separator to indicate that the first number in the input array is a throwaway number. this character is used only once to handle blocklist and/or padding
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

			// execute only if this is not the last number
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

		// if `minLength` is used and the ID is too short, add a throwaway number & start over
		if (this.minLength > id.length) {
			const partitionNumber = this.toNumber(
				alphabet.slice(0, this.minLength - id.length),
				alphabet
			);

			if (partitioned) {
				numbers[0] = partitionNumber;
			} else {
				numbers = [partitionNumber, ...numbers];
			}

			id = this.encodeNumbers(numbers, true);
		}

		// if ID has a blocked word anywhere, add a throwaway number & start over
		if (this.isBlockedId(id)) {
			if (partitioned) {
				numbers[0] += 1;
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
	 * @param {string} id Encoded ID
	 * @returns {array.<number>} Array of unsigned integers
	 */
	decode(id: string): number[] {
		// @todo check that characters are in the alphabet

		let ret: number[] = [];
		const originalId = id;

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

		// decode
		while (id.length) {
			// the first separator might be either `separator` or `partition` character. if partition character is anywhere in the generated ID, then the ID has throwaway number
			let separator = alphabet.slice(-1);
			if (id.includes(partition)) {
				separator = partition;
			}

			// we need the first part to the left of the separator to decode the number
			const chunks = id.split(separator);
			if (chunks.length) {
				// decode the number without using the `separator` character
				const alphabetWithoutSeparator = alphabet.slice(0, -1);
				ret.push(this.toNumber(chunks[0], alphabetWithoutSeparator));

				// if this ID has multiple numbers, shuffle the alphabet because that's what encoding function did
				if (chunks.length > 1) {
					alphabet = this.shuffle(alphabet);
				}
			}

			// `id` is now going to be everything to the right of the `separator`
			id = chunks.slice(1).join(separator);
		}

		// if original ID contains a `partition` character, remove the first number (it's junk)
		if (originalId.includes(partition)) {
			ret = ret.slice(1);
		}

		// if re-encoding does not produce the same result, ID is invalid
		if (this.encode(ret) != originalId) {
			ret = [];
		}

		return ret;
	}

	// always zero for every language
	minValue() {
		return 0;
	}

	// depends on the programming language & implementation
	maxValue() {
		return Number.MAX_VALUE;
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
		for (const word of this.blocklist) {
			if (id.toLowerCase().includes(word.toLowerCase())) {
				return true;
			}
		}

		return false;
	}
}
