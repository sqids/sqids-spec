import { expect, test } from 'vitest';
import Sqids from '../src/index.ts';

test('simple', () => {
	const sqids = new Sqids({
		alphabet: '0123456789abcdef'
	});

	const numbers = [1, 2, 3];
	const id = '489158';

	expect.soft(sqids.encode(numbers)).toBe(id);
	expect.soft(sqids.decode(id)).toEqual(numbers);
});

test('short alphabet', () => {
	const sqids = new Sqids({
		alphabet: 'abc'
	});

	const numbers = [1, 2, 3];
	expect.soft(sqids.decode(sqids.encode(numbers))).toEqual(numbers);
});

test('long alphabet', () => {
	const sqids = new Sqids({
		alphabet:
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+|{}[];:\'"/?.>,<`~'
	});

	const numbers = [1, 2, 3];
	expect.soft(sqids.decode(sqids.encode(numbers))).toEqual(numbers);
});

test.fails('repeating alphabet characters', () => {
	expect(
		new Sqids({
			alphabet: 'aabcdefg'
		})
	).rejects;
});

test.fails('too short of an alphabet', () => {
	expect(
		new Sqids({
			alphabet: 'ab'
		})
	).rejects;
});
