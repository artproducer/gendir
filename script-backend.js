(() => {
    const SUPABASE_URL = window.GENDIR_SUPABASE_URL || '';
    const SUPABASE_KEY = window.GENDIR_SUPABASE_KEY || '';
    const FAVORITES_TABLE = 'favorites';
    const TOOLS_TABLE = 'tools';
    const HISTORY_ENTRY_TYPE = 'bin_history';
    const HISTORY_RESET_TYPE = 'bin_history_reset';
    const SYNC_CODE_STORAGE_KEY = 'gendir_bin_sync_code';
    const FACE_PROXY_FUNCTION = 'face-proxy';

    let supabaseClient = null;

    function createSupabaseClient() {
        if (supabaseClient) return supabaseClient;

        if (!SUPABASE_URL || !SUPABASE_KEY) {
            console.warn('GenDir: Supabase URL or key is missing. Sync stays disabled.');
            return null;
        }

        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            console.warn('GenDir: Supabase client library is not available in the browser.');
            return null;
        }

        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return supabaseClient;
    }

    function toIsoString(value) {
        const date = value ? new Date(value) : new Date();
        return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }

    function makeEntryId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }

        return `bin-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    }

    function normalizeHistoryEntry(entry) {
        const source = entry || {};

        return {
            entryId: String(source.entryId || source.id || makeEntryId()),
            bin: String(source.bin || '').trim(),
            month: source.month ? String(source.month) : '',
            year: source.year ? String(source.year) : '',
            cvv: source.cvv ? String(source.cvv) : '',
            type: source.type ? String(source.type) : '',
            timestamp: toIsoString(source.timestamp || source.created_at)
        };
    }

    async function hashSyncCode(syncCode) {
        const normalized = String(syncCode || '').trim();
        if (!normalized) return '';

        if (window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined') {
            const encoded = new TextEncoder().encode(normalized);
            const digest = await window.crypto.subtle.digest('SHA-256', encoded);
            return Array.from(new Uint8Array(digest))
                .map((value) => value.toString(16).padStart(2, '0'))
                .join('');
        }

        let hash = 5381;
        for (let index = 0; index < normalized.length; index += 1) {
            hash = ((hash << 5) + hash) + normalized.charCodeAt(index);
        }

        return Math.abs(hash).toString(16);
    }

    function getStoredBinSyncCode() {
        return (localStorage.getItem(SYNC_CODE_STORAGE_KEY) || '').trim();
    }

    function setStoredBinSyncCode(syncCode) {
        const normalized = String(syncCode || '').trim();

        if (normalized) {
            localStorage.setItem(SYNC_CODE_STORAGE_KEY, normalized);
        } else {
            localStorage.removeItem(SYNC_CODE_STORAGE_KEY);
        }

        return normalized;
    }

    function isBinHistorySyncEnabled() {
        return Boolean(getStoredBinSyncCode());
    }

    async function getSyncUserId(syncCode = getStoredBinSyncCode()) {
        const normalized = String(syncCode || '').trim();
        if (!normalized) return '';

        const codeHash = await hashSyncCode(normalized);
        return `gendir-bin-sync-${codeHash}`;
    }

    async function getDynamicTools() {
        const client = createSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from(TOOLS_TABLE)
                .select('*')
                .order('title', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('GenDir: could not load dynamic tools from Supabase.', error.message);
            return null;
        }
    }

    async function saveSyncedBinHistoryEntry(entry, syncCode = getStoredBinSyncCode()) {
        const client = createSupabaseClient();
        if (!client || !syncCode) return false;

        const userId = await getSyncUserId(syncCode);
        const payload = normalizeHistoryEntry(entry);

        const { error } = await client
            .from(FAVORITES_TABLE)
            .insert([
                {
                    user_id: userId,
                    type: HISTORY_ENTRY_TYPE,
                    data: payload
                }
            ]);

        if (error) throw error;
        return true;
    }

    async function resetSyncedBinHistory(syncCode = getStoredBinSyncCode(), resetAt = new Date().toISOString()) {
        const client = createSupabaseClient();
        if (!client || !syncCode) return false;

        const userId = await getSyncUserId(syncCode);

        const { error } = await client
            .from(FAVORITES_TABLE)
            .insert([
                {
                    user_id: userId,
                    type: HISTORY_RESET_TYPE,
                    data: {
                        entryId: makeEntryId(),
                        resetAt: toIsoString(resetAt)
                    }
                }
            ]);

        if (error) throw error;
        return true;
    }

    async function fetchSyncedBinHistory(syncCode = getStoredBinSyncCode()) {
        const client = createSupabaseClient();
        if (!client || !syncCode) {
            return { items: [], resetAt: null };
        }

        const userId = await getSyncUserId(syncCode);
        const { data, error } = await client
            .from(FAVORITES_TABLE)
            .select('type, data, created_at')
            .eq('user_id', userId)
            .in('type', [HISTORY_ENTRY_TYPE, HISTORY_RESET_TYPE])
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) throw error;

        const rows = Array.isArray(data) ? data : [];
        let latestResetAt = null;

        rows.forEach((row) => {
            if (row.type !== HISTORY_RESET_TYPE) return;

            const resetAt = toIsoString((row.data && row.data.resetAt) || row.created_at);
            if (!latestResetAt || new Date(resetAt).getTime() > new Date(latestResetAt).getTime()) {
                latestResetAt = resetAt;
            }
        });

        const seenEntryIds = new Set();
        const items = [];

        rows.forEach((row) => {
            if (row.type !== HISTORY_ENTRY_TYPE) return;

            const entry = normalizeHistoryEntry(row.data || {});
            if (!entry.bin) return;

            if (latestResetAt && new Date(entry.timestamp).getTime() <= new Date(latestResetAt).getTime()) {
                return;
            }

            if (seenEntryIds.has(entry.entryId)) return;
            seenEntryIds.add(entry.entryId);
            items.push(entry);
        });

        items.sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

        return {
            items,
            resetAt: latestResetAt
        };
    }

    async function testSupabaseConnection() {
        const client = createSupabaseClient();
        if (!client) {
            console.log('GenDir: Supabase is not configured in this build.');
            return false;
        }

        try {
            const { count, error } = await client
                .from(FAVORITES_TABLE)
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            console.log(`GenDir: Supabase connected. Rows in '${FAVORITES_TABLE}': ${count}`);
            return true;
        } catch (error) {
            console.error('GenDir: Supabase connection test failed.', error.message);
            return false;
        }
    }

    function getFaceProxyUrl() {
        if (!SUPABASE_URL) return '';
        return `${SUPABASE_URL}/functions/v1/${FACE_PROXY_FUNCTION}`;
    }

    async function fetchFaceImageViaSupabaseProxy() {
        const proxyUrl = getFaceProxyUrl();
        if (!proxyUrl) {
            throw new Error('Supabase URL is missing.');
        }

        const response = await fetch(`${proxyUrl}?t=${Date.now()}-${Math.random().toString(16).slice(2, 10)}`, {
            method: 'GET',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Face proxy error (${response.status}).`);
        }

        const blob = await response.blob();
        if (!blob || !blob.size) {
            throw new Error('Face proxy returned an empty image.');
        }

        return URL.createObjectURL(blob);
    }

    window.getDynamicTools = getDynamicTools;
    window.testSupabaseConnection = testSupabaseConnection;
    window.getStoredBinSyncCode = getStoredBinSyncCode;
    window.setStoredBinSyncCode = setStoredBinSyncCode;
    window.isBinHistorySyncEnabled = isBinHistorySyncEnabled;
    window.fetchSyncedBinHistory = fetchSyncedBinHistory;
    window.saveSyncedBinHistoryEntry = saveSyncedBinHistoryEntry;
    window.resetSyncedBinHistory = resetSyncedBinHistory;
    window.getFaceProxyUrl = getFaceProxyUrl;
    window.fetchFaceImageViaSupabaseProxy = fetchFaceImageViaSupabaseProxy;
})();
