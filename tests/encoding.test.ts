import { expect, test } from 'vitest';
import Sqids from '../src/index.ts';

test('simple', () => {
	const sqids = new Sqids();

	const numbers = [1, 2, 3];
	const id = '86Rf07';

	expect.soft(sqids.encode(numbers)).toBe(id);
	expect.soft(sqids.decode(id)).toEqual(numbers);
});

test('different inputs', () => {
	const sqids = new Sqids();

	const numbers = [0, 0, 0, 1, 2, 3, 100, 1_000, 100_000, 1_000_000, Number.MAX_SAFE_INTEGER];
	expect.soft(sqids.decode(sqids.encode(numbers))).toEqual(numbers);
});

test('incremental numbers', () => {
	const sqids = new Sqids();

	const ids = {
		bM: [0],
		Uk: [1],
		gb: [2],
		Ef: [3],
		Vq: [4],
		uw: [5],
		OI: [6],
		AX: [7],
		p6: [8],
		nJ: [9]
	};

	for (const [id, numbers] of Object.entries(ids)) {
		expect.soft(sqids.encode(numbers)).toBe(id);
		expect.soft(sqids.decode(id)).toEqual(numbers);
	}
});

test('incremental numbers, same index 0', () => {
	const sqids = new Sqids();

	const ids = {
		SvIz: [0, 0],
		n3qa: [0, 1],
		tryF: [0, 2],
		eg6q: [0, 3],
		rSCF: [0, 4],
		sR8x: [0, 5],
		uY2M: [0, 6],
		'74dI': [0, 7],
		'30WX': [0, 8],
		moxr: [0, 9]
	};

	for (const [id, numbers] of Object.entries(ids)) {
		expect.soft(sqids.encode(numbers)).toBe(id);
		expect.soft(sqids.decode(id)).toEqual(numbers);
	}
});

test('incremental numbers, same index 1', () => {
	const sqids = new Sqids();

	const ids = {
		SvIz: [0, 0],
		nWqP: [1, 0],
		tSyw: [2, 0],
		eX68: [3, 0],
		rxCY: [4, 0],
		sV8a: [5, 0],
		uf2K: [6, 0],
		'7Cdk': [7, 0],
		'3aWP': [8, 0],
		m2xn: [9, 0]
	};

	for (const [id, numbers] of Object.entries(ids)) {
		expect.soft(sqids.encode(numbers)).toBe(id);
		expect.soft(sqids.decode(id)).toEqual(numbers);
	}
});

test('multi input', () => {
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

test('encoding no numbers', () => {
	const sqids = new Sqids();
	expect.soft(sqids.encode([])).toEqual('');
});

test('decoding empty string', () => {
	const sqids = new Sqids();
	expect.soft(sqids.decode('')).toEqual([]);
});

test('decoding an ID with an invalid character', () => {
	const sqids = new Sqids();
	expect.soft(sqids.decode('*')).toEqual([]);
});

test('encode out-of-range numbers', async () => {
	const encodingError = `Encoding supports numbers between 0 and ${Number.MAX_SAFE_INTEGER}`;

	const sqids = new Sqids();
	await expect(async () => sqids.encode([-1])).rejects.toThrow(encodingError);
	await expect(async () => sqids.encode([Number.MAX_SAFE_INTEGER + 1])).rejects.toThrow(
		encodingError
	);
});
