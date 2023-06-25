import { expect, test } from 'vitest';
import { defaultOptions } from '../src/index.ts';

// `shuffle` is an internal function, so these are tests to check how well it shuffles
// there's no need for individual implementations to copy over these tests

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
	const i = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const o = 'ec38UaynYXvoxSK7RV9uZ1D2HEPw6isrdzAmBNGT5OCJLk0jlFbtqWQ4hIpMgf';

	expect.soft(shuffle(i)).toBe(o);
});

test('swapping front 2 characters', () => {
	const i1 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const i2 = '1023456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	const o1 = 'ec38UaynYXvoxSK7RV9uZ1D2HEPw6isrdzAmBNGT5OCJLk0jlFbtqWQ4hIpMgf';
	const o2 = 'xI3RUayk1MSolQK7e09zYmFpVXPwHiNrdfBJ6ZAT5uCWbntgcDsEqjv4hLG28O';

	expect.soft(shuffle(i1)).toBe(o1);
	expect.soft(shuffle(i2)).toBe(o2);
});

test('swapping last 2 characters', () => {
	const i1 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const i2 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXZY';

	const o1 = 'ec38UaynYXvoxSK7RV9uZ1D2HEPw6isrdzAmBNGT5OCJLk0jlFbtqWQ4hIpMgf';
	const o2 = 'x038UaykZMSolIK7RzcbYmFpgXEPHiNr1d2VfGAT5uJWQetjvDswqn94hLC6BO';

	expect.soft(shuffle(i1)).toBe(o1);
	expect.soft(shuffle(i2)).toBe(o2);
});

test('short alphabet', () => {
	expect.soft(shuffle('0123456789')).toBe('4086517392');
});

test('really short alphabet', () => {
	expect.soft(shuffle('12345')).toBe('24135');
});

test('lowercase alphabet', () => {
	const i = 'abcdefghijklmnopqrstuvwxyz';
	const o = 'lbfziqvscptmyxrekguohwjand';

	expect.soft(shuffle(i)).toBe(o);
});

test('uppercase alphabet', () => {
	const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const o = 'ZXBNSIJQEDMCTKOHVWFYUPLRGA';

	expect.soft(shuffle(i)).toBe(o);
});

test('bars', () => {
	expect.soft(shuffle('▁▂▃▄▅▆▇█')).toBe('▂▇▄▅▆▃▁█');
});

test('bars with numbers', () => {
	expect.soft(shuffle('▁▂▃▄▅▆▇█0123456789')).toBe('14▅▂▇320▆75▄█96▃8▁');
});
