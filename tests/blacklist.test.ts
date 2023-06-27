import { expect, test } from 'vitest';
import Sqids from '../src/index.ts';

test('if no custom blacklist param, use the default blacklist', () => {
	const sqids = new Sqids();

	expect.soft(sqids.decode('sexy')).toEqual([200044]);
	expect.soft(sqids.encode([200044])).toBe('d171vI');
});

test(`if an empty blacklist param passed, don't use any blacklist`, () => {
	const sqids = new Sqids({
		blacklist: new Set([])
	});

	expect.soft(sqids.decode('sexy')).toEqual([200044]);
	expect.soft(sqids.encode([200044])).toBe('sexy');
});

test('if a non-empty blacklist param passed, use only that', () => {
	const sqids = new Sqids({
		blacklist: new Set([
			'AvTg' // originally encoded [100000]
		])
	});

	// make sure we don't use the default blacklist
	expect.soft(sqids.decode('sexy')).toEqual([200044]);
	expect.soft(sqids.encode([200044])).toBe('sexy');

	// make sure we are using the passed blacklist
	expect.soft(sqids.decode('AvTg')).toEqual([100000]);
	expect.soft(sqids.encode([100000])).toBe('7T1X8k');
	expect.soft(sqids.decode('7T1X8k')).toEqual([100000]);
});

test('blacklist', () => {
	const sqids = new Sqids({
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
		blacklist: new Set(['pPQ'])
	});

	expect.soft(sqids.decode(sqids.encode([1000]))).toEqual([1000]);
});
