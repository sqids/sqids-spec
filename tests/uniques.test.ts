import { expect, test } from 'vitest';
import Sqids, { defaultOptions } from '../src/index.ts';

const upper = 1_000_000;

test('uniques, with padding', () => {
	const sqids = new Sqids({
		...defaultOptions,
		minLength: defaultOptions.alphabet.length
	});
	const set = new Set<string>();

	for (let i = 0; i != upper; i++) {
		const numbers = [i];
		const id = sqids.encode(numbers);
		set.add(id);
		expect.soft(sqids.decode(id)).toEqual(numbers);
	}

	expect.soft(set.size).toBe(upper);
});

test('uniques, low ranges', () => {
	const sqids = new Sqids();
	const set = new Set<string>();

	for (let i = 0; i != upper; i++) {
		const numbers = [i];
		const id = sqids.encode(numbers);
		set.add(id);
		expect.soft(sqids.decode(id)).toEqual(numbers);
	}

	expect.soft(set.size).toBe(upper);
});

test('uniques, high ranges', () => {
	const sqids = new Sqids();
	const set = new Set<string>();

	for (let i = 100_000_000; i != 100_000_000 + upper; i++) {
		const numbers = [i];
		const id = sqids.encode(numbers);
		set.add(id);
		expect.soft(sqids.decode(id)).toEqual(numbers);
	}

	expect.soft(set.size).toBe(upper);
});

test('uniques, multi', () => {
	const sqids = new Sqids();
	const set = new Set<string>();

	for (let i = 0; i != upper; i++) {
		const numbers = [i, i, i, i, i];
		const id = sqids.encode(numbers);
		set.add(id);
		expect.soft(sqids.decode(id)).toEqual(numbers);
	}

	expect.soft(set.size).toBe(upper);
});
