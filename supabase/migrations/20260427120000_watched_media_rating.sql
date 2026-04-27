-- Per-user, per-item personal rating on a 1.0–10.0 scale (one decimal).
-- Lives on watched_media so a single row carries both "have I watched
-- this" and "what would I rate it" for the same (user, media, item).
-- NULL = unrated; the row may exist for rating-only or watched-only.

ALTER TABLE public.watched_media
    ADD COLUMN rating NUMERIC(3, 1);

ALTER TABLE public.watched_media
    ADD CONSTRAINT watched_media_rating_check
    CHECK (rating IS NULL OR (rating >= 1.0 AND rating <= 10.0));
