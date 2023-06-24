import { expect, test } from 'vitest';
import Sqids, { defaultOptions } from '../src/index.ts';

test('simple', () => {
	const sqids = new Sqids({
		...defaultOptions,
		minLength: defaultOptions.alphabet.length
	});

	const numbers = [1, 2, 3];
	const id = '75JILToVsGerOADWmHlY38xvbaNZKQ9wdFS0B6kcMEtnRpgizhjU42qT1cd0dL';

	expect.soft(sqids.encode(numbers)).toBe(id);
});

test('min lengths', () => {
	const sqids = new Sqids();

	for (const minLength of [1, 5, 10, defaultOptions.alphabet.length]) {
		for (const numbers of [
			[0],
			[0, 0, 0, 0, 0],
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			[100, 200, 300],
			[1_000, 2_000, 3_000],
			[1_000_000],
			[sqids.maxValue()]
		]) {
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

test.fails('out-of-range invalid min length', () => {
	expect(
		new Sqids({
			...defaultOptions,
			minLength: -1
		})
	).rejects;

	expect(
		new Sqids({
			...defaultOptions,
			minLength: defaultOptions.alphabet.length + 1
		})
	).rejects;
});
