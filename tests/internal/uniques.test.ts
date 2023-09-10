import { expect, test } from 'vitest';
import Sqids, { defaultOptions } from '../../src/index.ts';

// @NOTE: "uniques, with blocked words" is auto-tested since a lot of these big ids
// will match some words on the blocklist and will be re-generated anyway

const upTo = 2_000_000;

test('uniques', () => {
	const sqids = new Sqids();

	const idSet = new Set<string>();
	const numbersSet = new Set<string>();

	for (let i = 0; i != upTo; i++) {
		const numbers = [i];

		const id = sqids.encode(numbers);

		const decodedNumbers = sqids.decode(id);
		expect.soft(decodedNumbers).toEqual(numbers);

		idSet.add(id);
		numbersSet.add(decodedNumbers.join(','));
	}

	expect.soft(idSet.size).toBe(upTo);
	expect.soft(numbersSet.size).toBe(upTo);
});

test('uniques, with padding', () => {
	const sqids = new Sqids({
		minLength: defaultOptions.alphabet.length
	});

	const idSet = new Set<string>();
	const numbersSet = new Set<string>();

	for (let i = 0; i != upTo; i++) {
		const numbers = [i];

		const id = sqids.encode(numbers);

		const decodedNumbers = sqids.decode(id);
		expect.soft(decodedNumbers).toEqual(numbers);

		idSet.add(id);
		numbersSet.add(decodedNumbers.join(','));
	}

	expect.soft(idSet.size).toBe(upTo);
	expect.soft(numbersSet.size).toBe(upTo);
});

test('uniques, with multiple/random numbers', () => {
	const sqids = new Sqids();

	const idSet = new Set<string>();
	const numbersSet = new Set<string>();

	for (let i = 0; i != upTo; i++) {
		const numbers = [0, i, i + 1, Math.floor(Math.random() * 1_000), 999999999];

		const id = sqids.encode(numbers);

		const decodedNumbers = sqids.decode(id);
		expect.soft(decodedNumbers).toEqual(numbers);

		idSet.add(id);
		numbersSet.add(decodedNumbers.join(','));
	}

	expect.soft(idSet.size).toBe(upTo);
	expect.soft(numbersSet.size).toBe(upTo);
});
