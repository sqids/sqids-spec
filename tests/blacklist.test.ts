import { expect, test } from 'vitest';
import Sqids, { defaultOptions } from '../src/index.ts';

test('blacklist', () => {
	const sqids = new Sqids({
		...defaultOptions,
		blacklist: new Set([
			'8QRLaD', // normal result of 1st encoding, let's block that word on purpose
			'7T1cd0dL', // result of 2nd encoding
			'UeIe', // result of 3rd encoding is `RA8UeIe7`, let's block a substring
			'imhw', // result of 4th encoding is `WM3Limhw`, let's block the postfix
			'LfUQ' // result of 4th encoding is `LfUQh4HN`, let's block the prefix
		])
	});

	expect.soft(sqids.encode([1, 2, 3])).toBe('TM0x1Mxz');
	expect.soft(sqids.decode('TM0x1Mxz')).toEqual([1, 2, 3]);
});

test('decoding blacklisted words should still work', () => {
	const sqids = new Sqids({
		...defaultOptions,
		blacklist: new Set(['8QRLaD', '7T1cd0dL', 'RA8UeIe7', 'WM3Limhw', 'LfUQh4HN'])
	});

	expect.soft(sqids.decode('8QRLaD')).toEqual([1, 2, 3]);
	expect.soft(sqids.decode('7T1cd0dL')).toEqual([1, 2, 3]);
	expect.soft(sqids.decode('RA8UeIe7')).toEqual([1, 2, 3]);
	expect.soft(sqids.decode('WM3Limhw')).toEqual([1, 2, 3]);
	expect.soft(sqids.decode('LfUQh4HN')).toEqual([1, 2, 3]);
});

test('match against a short blacklisted word', () => {
	const sqids = new Sqids({
		...defaultOptions,
		blacklist: new Set(['pPQ'])
	});

	expect.soft(sqids.decode(sqids.encode([1000]))).toEqual([1000]);
});
