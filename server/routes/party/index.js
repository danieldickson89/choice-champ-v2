const express = require('express');
const router = express();

const { supabase } = require('../../lib/supabase');
const { requireAuth } = require('../../middleware/auth');

// Party URLs are accessible without auth — invited participants may not have
// an account. Owner identification is currently by userId query/body param
// (legacy behavior preserved). Tightening this requires a separate auth pass.

// Smart-quote-safe trim. Mirrors collections/index.js so a party export
// produces a name in the same shape as a hand-typed collection name.
const normalizeCollectionName = (raw) => {
    if (raw == null) return raw;
    return String(raw)
        .replace(/[‘’‚‛]/g, "'")
        .replace(/[“”„‟]/g, '"')
        .trim();
};

const generateShareCode = async () => {
    for (let i = 0; i < 20; i++) {
        const code = String(Math.floor(10000 + Math.random() * 90000));
        const { count } = await supabase
            .from('collections')
            .select('id', { count: 'exact', head: true })
            .eq('share_code', code);
        if (!count) return code;
    }
    throw new Error('Failed to generate unique share code');
};

// Map parties + party_items rows to the legacy response shape.
const partyToLegacy = (row, items) => ({
    _id: row.id,
    code: row.code,
    mediaType: row.media_type,
    secretMode: row.secret_mode,
    includeWatched: row.include_watched,
    superChoice: row.super_choice,
    memberCount: row.member_count,
    items: (items || []).map(it => ({
        _id: it.id,
        title: it.title,
        poster: it.poster,
        itemId: it.item_id,
        watched: it.watched,
    })),
});

const generatePartyCode = async () => {
    for (let i = 0; i < 20; i++) {
        const code = String(Math.floor(1000 + Math.random() * 9000));
        const { count } = await supabase
            .from('parties')
            .select('id', { count: 'exact', head: true })
            .eq('code', code);
        if (!count) return code;
    }
    throw new Error('Failed to generate unique party code');
};

router
    .get('/exists/:code', async (req, res) => {
        const { data: party, error } = await supabase
            .from('parties')
            .select('code')
            .eq('code', req.params.code)
            .maybeSingle();
        if (error) return res.status(500).send({ errorMsg: error.message });
        if (!party) return res.status(404).send({ errorMsg: 'No party found with the given code' });
        res.send({ code: party.code });
    })
    .get('/:code', async (req, res) => {
        const userId = req.query.userId;

        const { data: party, error } = await supabase
            .from('parties')
            .select('*, party_items(*)')
            .eq('code', req.params.code)
            .maybeSingle();
        if (error) return res.status(500).send({ errMsg: error.message });
        if (!party) return res.status(404).send({ errMsg: 'Party not found' });

        const isOwner = userId && String(party.host_id) === String(userId);
        res.send({ party: partyToLegacy(party, party.party_items), owner: Boolean(isOwner) });
    })
    .delete('/:code', async (req, res) => {
        const { error } = await supabase
            .from('parties')
            .delete()
            .eq('code', req.params.code);
        if (error) return res.status(500).send({ errMsg: error.message });
        res.send('Success');
    })
    .post('/', async (req, res) => {
        const { collections: collectionIDs, mediaType, secretMode, includeWatched, superChoice, owner } = req.body;
        if (!owner) return res.status(400).send({ errMsg: 'owner is required' });
        if (!Array.isArray(collectionIDs) || collectionIDs.length === 0) {
            return res.status(400).send({ errMsg: 'collections must be a non-empty array' });
        }

        let partyCode;
        try {
            partyCode = await generatePartyCode();
        } catch (err) {
            return res.status(500).send({ errMsg: err.message });
        }

        const { data: items, error: itemsErr } = await supabase
            .from('collection_items')
            .select('item_id, title, poster, complete')
            .in('collection_id', collectionIDs);
        if (itemsErr) return res.status(500).send({ errMsg: itemsErr.message });

        const { data: newParty, error: partyErr } = await supabase
            .from('parties')
            .insert({
                host_id: owner,
                code: partyCode,
                media_type: mediaType,
                secret_mode: Boolean(secretMode),
                include_watched: Boolean(includeWatched),
                super_choice: Boolean(superChoice),
                member_count: 0,
            })
            .select()
            .single();
        if (partyErr) return res.status(500).send({ errMsg: partyErr.message });

        if (items.length > 0) {
            const itemRows = items.map(it => ({
                party_id: newParty.id,
                item_id: it.item_id,
                title: it.title,
                poster: it.poster,
                watched: it.complete,
            }));
            const { error: piErr } = await supabase.from('party_items').insert(itemRows);
            if (piErr) return res.status(500).send({ errMsg: piErr.message });
        }

        // Bump the lifetime party counter.
        const { data: stats } = await supabase.from('app_stats').select('party_count_total').eq('id', 1).single();
        if (stats) {
            await supabase
                .from('app_stats')
                .update({ party_count_total: stats.party_count_total + 1 })
                .eq('id', 1);
        }

        res.send({ partyCode });
    })
    // Save the items remaining in a flag-ended party as a brand-new
    // collection. Body carries the remaining items (frontend tracks
    // them in voting state — server doesn't follow vote-outs), the
    // chosen name + type, a "share with the party" flag, and the list
    // of other logged-in member user_ids the frontend pulled from the
    // realtime presence channel. Only logged-in callers can export.
    .post('/:code/export', requireAuth, async (req, res) => {
        const userId = req.user.id;
        const name = normalizeCollectionName(req.body?.name || '');
        const type = req.body?.type;
        const share = Boolean(req.body?.share);
        const otherUserIds = Array.isArray(req.body?.otherUserIds) ? req.body.otherUserIds : [];
        const items = Array.isArray(req.body?.items) ? req.body.items : [];

        if (!name) return res.status(400).json({ errMsg: 'Name is required' });
        if (!type) return res.status(400).json({ errMsg: 'Type is required' });
        if (items.length === 0) return res.status(400).json({ errMsg: 'No items to save' });

        let shareCode;
        try {
            shareCode = await generateShareCode();
        } catch (err) {
            return res.status(500).json({ errMsg: err.message });
        }

        const { data: newCollection, error: cErr } = await supabase
            .from('collections')
            .insert({ owner_id: userId, share_code: shareCode, name, type })
            .select()
            .single();
        if (cErr) return res.status(500).json({ errMsg: cErr.message });

        // Memberships — creator always; other party members only if
        // the user opted into sharing. Dedupe and exclude self.
        const memberRows = [{ collection_id: newCollection.id, user_id: userId }];
        if (share) {
            const uniqueOthers = [...new Set(otherUserIds.map(String))]
                .filter(id => id && id !== String(userId));
            for (const id of uniqueOthers) {
                memberRows.push({ collection_id: newCollection.id, user_id: id });
            }
        }
        const { error: memErr } = await supabase
            .from('collection_members')
            .insert(memberRows);
        if (memErr) return res.status(500).json({ errMsg: memErr.message });

        const itemRows = items
            .map(it => ({
                collection_id: newCollection.id,
                item_id: String(it.itemId ?? it.item_id ?? ''),
                media_type: type,
                title: it.title,
                poster: it.poster ?? null,
                complete: false,
            }))
            .filter(r => r.item_id && r.title);

        if (itemRows.length > 0) {
            const { error: itemErr } = await supabase
                .from('collection_items')
                .insert(itemRows);
            if (itemErr) return res.status(500).json({ errMsg: itemErr.message });
        }

        res.status(201).json({
            collectionId: newCollection.id,
            name: newCollection.name,
            type: newCollection.type,
            shareCode: newCollection.share_code,
            isShared: share,
            memberCount: memberRows.length,
        });
    });

module.exports = router;
