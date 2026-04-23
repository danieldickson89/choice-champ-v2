import { BACKEND_URL } from '../shared/config';

export const SUBTABS = {
    movie: [
        { key: 'trending',  label: 'Trending' },
        { key: 'popular',   label: 'Popular' },
        { key: 'top_rated', label: 'Top Rated' },
        { key: 'upcoming',  label: 'Upcoming' },
    ],
    tv: [
        { key: 'trending',  label: 'Trending' },
        { key: 'popular',   label: 'Popular' },
        { key: 'top_rated', label: 'Top Rated' },
        { key: 'on_air',    label: 'On Air' },
    ],
    board: [
        { key: 'hot', label: 'Hot' },
    ],
};

async function handleDiscoverResponse(res) {
    if(!res.ok) {
        const err = new Error(`Discover request failed (${res.status})`);
        err.status = res.status;
        try {
            const body = await res.json();
            if(body && body.errMsg) err.message = body.errMsg;
        } catch(_) {}
        throw err;
    }
    return res.json();
}

export async function fetchDiscover(type, feed, page = 1) {
    const res = await fetch(`${BACKEND_URL}/media/discover/${type}/${feed}?page=${page}`);
    return handleDiscoverResponse(res);
}

export async function fetchSearch(type, query, page = 1) {
    const res = await fetch(`${BACKEND_URL}/media/discover/${type}/search?q=${encodeURIComponent(query)}&page=${page}`);
    return handleDiscoverResponse(res);
}
