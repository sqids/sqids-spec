import { expect, test } from 'vitest';
import Sqids from '../src/index.ts';

test('uniques', () => {
	const sqids = new Sqids();
	const max = 1_000_000;
	const set = new Set<string>();

	for (let i = 0; i != max; i++) {
		const id = sqids.encode([i]);
		set.add(id);
		expect.soft(sqids.decode(id)).toEqual([i]);
	}

	expect.soft(set.size).toBe(max);
});
