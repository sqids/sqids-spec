import { expect, test } from 'vitest';
import { defaultOptions } from '../index.ts';

// `shuffle` should stay an internal function, so these are tests to experiment with randomness

const shuffle = (alphabet: string): string => {
	const chars = alphabet.split('');

	for (let i = 0, j = chars.length - 1; j > 0; i++, j--) {
		const r = (i * j + chars[i].codePointAt(0) + chars[j].codePointAt(0)) % chars.length;
		[chars[i], chars[r]] = [chars[r], chars[i]];
	}

	return chars.join('');
};

test('default shuffle, checking for randomness', () => {
	expect
		.soft(shuffle(defaultOptions.alphabet))
		.toBe('fwjBhEY2uczNPDiloxmvISCrytaJO4d71T0W3qnMZbXVHg6eR8sAQ5KkpLUGF9');
});

test('numbers in the front, another check for randomness', () => {
	expect
		.soft(shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'))
		.toBe('ec38UaynYXvoxSK7RV9uZ1D2HEPw6isrdzAmBNGT5OCJLk0jlFbtqWQ4hIpMgf');
});

test('swapping front 2 characters', () => {
	expect
		.soft(shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'))
		.toBe('ec38UaynYXvoxSK7RV9uZ1D2HEPw6isrdzAmBNGT5OCJLk0jlFbtqWQ4hIpMgf');
	expect
		.soft(shuffle('1023456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'))
		.toBe('xI3RUayk1MSolQK7e09zYmFpVXPwHiNrdfBJ6ZAT5uCWbntgcDsEqjv4hLG28O');
});

test('short alphabet', () => {
	expect.soft(shuffle('0123456789')).toBe('4086517392');
});

test('lowercase alphabet', () => {
	expect.soft(shuffle('abcdefghijklmnopqrstuvwxyz')).toBe('lbfziqvscptmyxrekguohwjand');
});

test('uppercase alphabet', () => {
	expect.soft(shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe('ZXBNSIJQEDMCTKOHVWFYUPLRGA');
});

test('bars', () => {
	expect.soft(shuffle('▁▂▃▄▅▆▇█')).toBe('▂▇▄▅▆▃▁█');
});

test('bars with numbers', () => {
	expect.soft(shuffle('▁▂▃▄▅▆▇█0123456789')).toBe('14▅▂▇320▆75▄█96▃8▁');
});
