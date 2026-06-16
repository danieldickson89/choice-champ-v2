import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applySortAndFilter, sortItems, filterItems } from './collectionSort.mjs';

// Minimal item factory — only the fields the sort/filter logic reads.
const item = (id, overrides = {}) => ({
    _id: id,
    title: id,
    timestamp: 0,
    watched: false,
    completedAt: 0,
    releaseDate: null,
    userRating: null,
    imdbRating: null,
    poster: `${id}.jpg`,
    ...overrides,
});

const ids = (arr) => arr.map(i => i._id);

test('recent (default) sorts newest-added first', () => {
    const items = [item('a', { timestamp: 1 }), item('b', { timestamp: 3 }), item('c', { timestamp: 2 })];
    assert.deepEqual(ids(applySortAndFilter(items, { sort: 'recent' })), ['b', 'c', 'a']);
});

test('oldest sorts oldest-added first', () => {
    const items = [item('a', { timestamp: 1 }), item('b', { timestamp: 3 }), item('c', { timestamp: 2 })];
    assert.deepEqual(ids(applySortAndFilter(items, { sort: 'oldest' })), ['a', 'c', 'b']);
});

test('abc / zyx sort by title', () => {
    const items = [item('Banana'), item('apple'), item('Cherry')];
    assert.deepEqual(ids(applySortAndFilter(items, { sort: 'abc' })), ['apple', 'Banana', 'Cherry']);
    assert.deepEqual(ids(applySortAndFilter(items, { sort: 'zyx' })), ['Cherry', 'Banana', 'apple']);
});

test('release-desc / asc put missing release dates at the bottom both ways', () => {
    const items = [
        item('new', { releaseDate: '2020-01-01' }),
        item('old', { releaseDate: '1999-01-01' }),
        item('none', { releaseDate: null, timestamp: 5 }),
    ];
    assert.deepEqual(ids(applySortAndFilter(items, { sort: 'release-desc' })), ['new', 'old', 'none']);
    assert.deepEqual(ids(applySortAndFilter(items, { sort: 'release-asc' })), ['old', 'new', 'none']);
});

test('rating sorts put unrated at the bottom regardless of direction', () => {
    const items = [
        item('hi', { userRating: 5 }),
        item('lo', { userRating: 2 }),
        item('unrated', { userRating: null, timestamp: 9 }),
    ];
    assert.deepEqual(ids(applySortAndFilter(items, { sort: 'rating-desc' })), ['hi', 'lo', 'unrated']);
    assert.deepEqual(ids(applySortAndFilter(items, { sort: 'rating-asc' })), ['lo', 'hi', 'unrated']);
});

test('watched/unwatched filter on group-complete flag', () => {
    const items = [item('done', { watched: true }), item('todo', { watched: false })];
    assert.deepEqual(ids(filterItems(items, { filter: 'watched' })), ['done']);
    assert.deepEqual(ids(filterItems(items, { filter: 'unwatched' })), ['todo']);
    assert.deepEqual(ids(filterItems(items, { filter: 'all' })), ['done', 'todo']);
});

test('query does a case-insensitive title substring match', () => {
    const items = [item('The Matrix'), item('Matrix Reloaded'), item('Inception')];
    assert.deepEqual(ids(filterItems(items, { query: 'matrix' })), ['The Matrix', 'Matrix Reloaded']);
});

test('custom sort preserves input order without a customOrder list', () => {
    const items = [item('c'), item('a'), item('b')];
    assert.deepEqual(ids(sortItems(items, 'custom')), ['c', 'a', 'b']);
});

test('custom sort reorders by a customOrder id list (list-page case)', () => {
    const items = [item('a'), item('b'), item('c')];
    // Backend order a,b,c but user dragged them to c,a,b
    assert.deepEqual(ids(sortItems(items, 'custom', ['c', 'a', 'b'])), ['c', 'a', 'b']);
});

test('custom sort sends ids missing from the order list to the end', () => {
    const items = [item('a'), item('b'), item('new')];
    assert.deepEqual(ids(sortItems(items, 'custom', ['b', 'a'])), ['b', 'a', 'new']);
});

test('does not mutate the input array', () => {
    const items = [item('a', { timestamp: 1 }), item('b', { timestamp: 2 })];
    const before = ids(items);
    applySortAndFilter(items, { sort: 'recent' });
    assert.deepEqual(ids(items), before);
});

test('filter + sort compose: unwatched, then A–Z', () => {
    const items = [
        item('Zelda', { watched: false }),
        item('Done', { watched: true }),
        item('Among Us', { watched: false }),
    ];
    const out = applySortAndFilter(items, { sort: 'abc', filter: 'unwatched' });
    assert.deepEqual(ids(out), ['Among Us', 'Zelda']);
});
