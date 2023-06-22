import { expect, test } from 'vitest';
import Sqids, { defaultOptions } from '../src/index.ts';

test.fails('repeating alphabet characters', () => {
	expect(
		new Sqids({
			...defaultOptions,
			alphabet: 'aabcdefg'
		})
	).rejects;
});

test.fails('short custom alphabet', () => {
	expect(
		new Sqids({
			...defaultOptions,
			alphabet: 'abc'
		})
	).rejects;
});

test.fails('encode out-of-range numbers', () => {
	const sqids = new Sqids();
	expect(sqids.encode([sqids.maxValue() - 1])).rejects;
	expect(sqids.encode([sqids.maxValue() + 1])).rejects;
});
