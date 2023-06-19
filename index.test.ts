import { expect, test } from 'vitest';
import Sqids, { defaultOptions } from './index.ts';

test('incremental numbers', () => {
	const sqids = new Sqids();

	expect.soft(sqids.encode([0])).toBe('vn');
	expect.soft(sqids.encode([1])).toBe('et');
	expect.soft(sqids.encode([2])).toBe('ni');
	expect.soft(sqids.encode([3])).toBe('g6');
	expect.soft(sqids.encode([4])).toBe('tP');
});

test('incremental numbers, same prefix', () => {
	const sqids = new Sqids();

	expect.soft(sqids.encode([0, 0])).toBe('egvK');
	expect.soft(sqids.encode([0, 1])).toBe('ghnJ');
	expect.soft(sqids.encode([0, 2])).toBe('hjts');
	expect.soft(sqids.encode([0, 3])).toBe('jCi1');
	expect.soft(sqids.encode([0, 4])).toBe('Cm6u');
});

test('incremental numbers, same postfix', () => {
	const sqids = new Sqids();

	expect.soft(sqids.encode([0, 0])).toBe('egvK');
	expect.soft(sqids.encode([1, 0])).toBe('nhet');
	expect.soft(sqids.encode([2, 0])).toBe('gjnh');
	expect.soft(sqids.encode([3, 0])).toBe('tCgH');
	expect.soft(sqids.encode([4, 0])).toBe('hmtj');
});

test('decoding', () => {
	const sqids = new Sqids();

	expect.soft(sqids.decode('egvK')).toEqual([0, 0]);
	expect.soft(sqids.decode('ntep')).toEqual([0, 1]);
	expect.soft(sqids.decode('ghnO')).toEqual([0, 2]);
	expect.soft(sqids.decode('tigD')).toEqual([0, 3]);
	expect.soft(sqids.decode('hjtu')).toEqual([0, 4]);
});

test('minimum length', () => {
	for (const minLength of [1, 10, defaultOptions.alphabet.length]) {
		for (const numbers of [[0], [1, 2, 3, 4, 5], [100, 200, 300], [1000000]]) {
			const sqids = new Sqids({
				...defaultOptions,
				minLength
			});

			const id = sqids.encode(numbers);
			expect.soft(id.length).toBeGreaterThanOrEqual(minLength);
			expect.soft(sqids.decode(id)).toEqual(numbers);
		}
	}
});

test('blocklist', () => {
	const sqids = new Sqids({
		...defaultOptions,
		blocklist: new Set([
			'syrjLE', // result of the 1st encoding
			'zkleEBnG', // result of the 2nd encoding
			'DkXJ5q' // result of the 3rd encoding is "lDkXJ5q5", but let's check substring
		])
	});

	expect.soft(sqids.encode([1, 2, 3])).toBe('kQBclabQ');
	expect.soft(sqids.decode('kQBclabQ')).toEqual([1, 2, 3]);
});

test('encoding/decoding', () => {
	const sqids = new Sqids();

	const numbers = [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
		26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
		50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73,
		74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
		98, 99
	];
	const output = sqids.decode(sqids.encode(numbers));
	expect.soft(numbers).toEqual(output);
});
