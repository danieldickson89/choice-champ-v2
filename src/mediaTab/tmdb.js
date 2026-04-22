const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';
const TMDB_KEY = process.env.REACT_APP_TMDB_API_KEY;

export const SUBTABS = {
    movie: [
        { key: 'trending',  label: 'Trending',  path: '/trending/movie/week' },
        { key: 'popular',   label: 'Popular',   path: '/movie/popular' },
        { key: 'top_rated', label: 'Top Rated', path: '/movie/top_rated' },
        { key: 'upcoming',  label: 'Upcoming',  path: '/movie/upcoming' },
    ],
    tv: [
        { key: 'trending',  label: 'Trending',  path: '/trending/tv/week' },
        { key: 'popular',   label: 'Popular',   path: '/tv/popular' },
        { key: 'top_rated', label: 'Top Rated', path: '/tv/top_rated' },
        { key: 'on_air',    label: 'On Air',    path: '/tv/on_the_air' },
    ],
};

export const hasTmdbKey = () => Boolean(TMDB_KEY);

export async function fetchTmdb(path) {
    if (!TMDB_KEY) {
        const err = new Error('MISSING_KEY');
        err.code = 'MISSING_KEY';
        throw err;
    }
    const separator = path.includes('?') ? '&' : '?';
    const res = await fetch(`${TMDB_BASE}${path}${separator}api_key=${TMDB_KEY}`);
    if (!res.ok) {
        const err = new Error(`TMDB request failed (${res.status})`);
        err.code = 'HTTP_ERROR';
        err.status = res.status;
        throw err;
    }
    return res.json();
}

export function normalizeItems(type, results) {
    return results.map(item => ({
        id: item.id,
        title: type === 'movie' ? item.title : item.name,
        poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
        rating: item.vote_average,
        releaseDate: type === 'movie' ? item.release_date : item.first_air_date,
    }));
}
