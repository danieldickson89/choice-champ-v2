// Pure sort + filter logic for a collection's items, shared between the
// Collection page (the live grid) and the collections list page (the preview
// thumbnails on each collection card) so both order items identically.
//
// Kept free of component state so it can run anywhere: it reads only fields
// the item itself carries (both the collection page and the list endpoint
// provide userRating + imdbRating). Items missing a rating sort to the bottom
// by date added, the same in the grid and in the card previews.

// Server provides `timestamp` (Unix seconds, derived from added_at).
const addedAt = (item) => item?.timestamp || 0;

// Case-insensitive title substring match + group-completion filter.
// `filter` is 'all' | 'watched' | 'unwatched'; `query` is optional.
export function filterItems(items, { filter = 'all', query = '' } = {}) {
    let result = items;
    const q = (query || '').trim().toLowerCase();
    if (q) result = result.filter(i => i.title && i.title.toLowerCase().includes(q));
    if (filter === 'watched') result = result.filter(i => i.watched);
    else if (filter === 'unwatched') result = result.filter(i => !i.watched);
    return result;
}

// Reorder items to match a saved custom-order array of item `_id`s. Items not
// present in the array keep their relative order at the end (JS sort is stable).
function orderByIds(items, ids) {
    const rank = new Map(ids.map((id, i) => [String(id), i]));
    const at = (item) => (rank.has(String(item?._id)) ? rank.get(String(item._id)) : Infinity);
    return [...items].sort((a, b) => at(a) - at(b));
}

// Returns a new sorted array. 'custom' preserves the input order unless a
// `customOrder` id list is supplied (the list page passes one; the Collection
// page's items are already in custom order, so it doesn't need to).
export function sortItems(items, sort, customOrder = null) {
    if (sort === 'custom') {
        if (Array.isArray(customOrder) && customOrder.length) return orderByIds(items, customOrder);
        return items; // already in the user's saved custom order
    } else if (sort === 'abc') {
        return [...items].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'zyx') {
        return [...items].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === 'oldest') {
        return [...items].sort((a, b) => addedAt(a) - addedAt(b));
    } else if (sort === 'watched') {
        // Recently watched first, never-watched items at the bottom ordered
        // by date added so they're not in arbitrary order.
        return [...items].sort((a, b) => {
            const ca = a?.completedAt || 0;
            const cb = b?.completedAt || 0;
            if (ca !== cb) return cb - ca;
            return addedAt(b) - addedAt(a);
        });
    } else if (sort === 'release-desc' || sort === 'release-asc') {
        // releaseDate is a 'YYYY-MM-DD' string from the server, so it sorts
        // lexicographically. Items missing a release date fall to the bottom
        // either direction.
        const dir = sort === 'release-desc' ? -1 : 1;
        return [...items].sort((a, b) => {
            const ra = a?.releaseDate || null;
            const rb = b?.releaseDate || null;
            if (!ra && !rb) return addedAt(b) - addedAt(a);
            if (!ra) return 1;
            if (!rb) return -1;
            if (ra !== rb) return (ra < rb ? -1 : 1) * dir;
            return addedAt(b) - addedAt(a);
        });
    } else if (sort === 'rating-desc' || sort === 'rating-asc') {
        // Personal rating first, unrated items always at the bottom (by date
        // added) regardless of direction.
        const dir = sort === 'rating-desc' ? -1 : 1;
        return [...items].sort((a, b) => {
            const ra = a?.userRating;
            const rb = b?.userRating;
            if (ra == null && rb == null) return addedAt(b) - addedAt(a);
            if (ra == null) return 1;
            if (rb == null) return -1;
            if (ra !== rb) return (ra - rb) * dir;
            return addedAt(b) - addedAt(a);
        });
    } else if (sort === 'imdb-desc' || sort === 'imdb-asc') {
        // Same null-to-bottom convention as personal rating.
        const dir = sort === 'imdb-desc' ? -1 : 1;
        return [...items].sort((a, b) => {
            const ra = a?.imdbRating;
            const rb = b?.imdbRating;
            if (ra == null && rb == null) return addedAt(b) - addedAt(a);
            if (ra == null) return 1;
            if (rb == null) return -1;
            if (ra !== rb) return (ra - rb) * dir;
            return addedAt(b) - addedAt(a);
        });
    }
    // recent / newest first (default)
    return [...items].sort((a, b) => addedAt(b) - addedAt(a));
}

export function applySortAndFilter(items, { sort = 'recent', filter = 'all', query = '', customOrder = null } = {}) {
    return sortItems(filterItems(items, { filter, query }), sort, customOrder);
}
