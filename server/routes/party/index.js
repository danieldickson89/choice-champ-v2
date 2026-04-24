const express = require('express');
const router = express();

const { supabase } = require('../../lib/supabase');

// Party URLs are accessible without auth — invited participants may not have
// an account. Owner identification is currently by userId query/body param
// (legacy behavior preserved). Tightening this requires a separate auth pass.

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
    .post('/add-member/:code', async (req, res) => {
        const { data: party, error: fetchErr } = await supabase
            .from('parties')
            .select('id, member_count')
            .eq('code', req.params.code)
            .maybeSingle();
        if (fetchErr) return res.status(500).send({ errorMsg: fetchErr.message });
        if (!party) return res.status(404).send({ errorMsg: 'Party not found' });

        const { error } = await supabase
            .from('parties')
            .update({ member_count: party.member_count + 1, last_activity_at: new Date().toISOString() })
            .eq('id', party.id);
        if (error) return res.status(500).send({ errorMsg: error.message });
        res.send('Success');
    })
    .post('/remove-member/:code', async (req, res) => {
        const { data: party, error: fetchErr } = await supabase
            .from('parties')
            .select('id, member_count')
            .eq('code', req.params.code)
            .maybeSingle();
        if (fetchErr) return res.status(500).send({ errorMsg: fetchErr.message });
        if (!party) return res.status(404).send({ errorMsg: 'Party not found' });

        const { error } = await supabase
            .from('parties')
            .update({ member_count: Math.max(0, party.member_count - 1), last_activity_at: new Date().toISOString() })
            .eq('id', party.id);
        if (error) return res.status(500).send({ errorMsg: error.message });
        res.send('Success');
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
    });

module.exports = router;
