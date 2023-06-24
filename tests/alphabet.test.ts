import { expect, test } from 'vitest';
import Sqids, { defaultOptions } from '../src/index.ts';

test('simple', () => {
	const sqids = new Sqids({
		...defaultOptions,
		alphabet: '0123456789abcdef'
	});

	const numbers = [1, 2, 3];
	const id = '4d9fd2';

	expect.soft(sqids.encode(numbers)).toBe(id);
	expect.soft(sqids.decode(id)).toEqual(numbers);
});

test('short alphabet', () => {
	const sqids = new Sqids({
		...defaultOptions,
		alphabet: 'abcde'
	});

	const numbers = [1, 2, 3];
	expect.soft(sqids.decode(sqids.encode(numbers))).toEqual(numbers);
});

test('long alphabet', () => {
	const sqids = new Sqids({
		...defaultOptions,
		alphabet:
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+|{}[];:\'"/?.>,<`~'
	});

	const numbers = [1, 2, 3];
	expect.soft(sqids.decode(sqids.encode(numbers))).toEqual(numbers);
});

test.fails('repeating alphabet characters', () => {
	expect(
		new Sqids({
			...defaultOptions,
			alphabet: 'aabcdefg'
		})
	).rejects;
});

test.fails('too short of an alphabet', () => {
	expect(
		new Sqids({
			...defaultOptions,
			alphabet: 'abcd'
		})
	).rejects;
});
