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

test('multibyte characters', async () => {
	await expect(
		async () =>
			new Sqids({
				alphabet: 'ë1092'
			})
	).rejects.toThrow('Alphabet cannot contain multibyte characters');
});

test('repeating alphabet characters', async () => {
	await expect(
		async () =>
			new Sqids({
				alphabet: 'aabcdefg'
			})
	).rejects.toThrow('Alphabet must contain unique characters');
});

test('too short of an alphabet', async () => {
	await expect(
		async () =>
			new Sqids({
				alphabet: 'ab'
			})
	).rejects.toThrow('Alphabet length must be at least 3');
});
