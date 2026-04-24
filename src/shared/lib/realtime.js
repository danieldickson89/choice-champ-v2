import { supabase } from './supabase';

// Fire-and-forget broadcast to a Realtime channel.
// Used for notifying collection members when an item is added / removed /
// toggled from a page that isn't subscribed to that channel itself
// (e.g. ItemDetails pushing into a Collection view).
export async function broadcast(channelName, event, payload) {
    const channel = supabase.channel(channelName);
    await new Promise((resolve) => {
        channel.subscribe((status) => {
            if (status !== 'SUBSCRIBED') return;
            channel.send({ type: 'broadcast', event, payload }).finally(() => {
                supabase.removeChannel(channel).finally(resolve);
            });
        });
    });
}
