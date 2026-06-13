import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';

// Fallbacks if the Config table is missing or unreachable
const DEFAULT_CONFIG = { initial_kitty: 320, trolley_cost: 5, parking_cost: 2 };
const SHOP_ID_KEY = 'vege_shop_id';

export function useShoppingSession() {
    const [items, setItems] = useState([]);
    const [kitty, setKitty] = useState(DEFAULT_CONFIG.initial_kitty);
    const [counts, setCounts] = useState({ vegetable: 0, fruit: 0, other: 0 });
    const [shopId, setShopId] = useState(null);
    const [people, setPeople] = useState([]);
    const [personId, setPersonId] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const shopIdRef = useRef(null);
    const configRef = useRef(DEFAULT_CONFIG);

    // Load config (kitty, trolley/parking costs) from the Config table
    useEffect(() => {
        const loadConfig = async () => {
            const { data } = await supabase.from('Config').select('ConfigKey, ConfigValue');
            if (data && data.length > 0) {
                const cfg = { ...DEFAULT_CONFIG };
                data.forEach(row => { cfg[row.ConfigKey] = Number(row.ConfigValue); });
                configRef.current = cfg;
                setItems(prev => { calculateState(prev); return prev; });
            }
        };
        loadConfig();
    }, []);

    // Load people
    useEffect(() => {
        const loadPeople = async () => {
            const { data } = await supabase.from('Person').select('*').order('PersonName');
            if (data) {
                setPeople(data);
                if (data.length > 0) setPersonId(data[0].PersonID);
            }
        };
        loadPeople();
    }, []);

    // Restore session from AsyncStorage
    useEffect(() => {
        const restore = async () => {
            const stored = await AsyncStorage.getItem(SHOP_ID_KEY);
            if (stored) {
                shopIdRef.current = stored;
                setShopId(stored);
                refreshItems(stored);
            }
            setIsInitialized(true);
        };
        restore();
    }, []);

    // Persist shopId
    useEffect(() => {
        if (!isInitialized) return;
        if (shopId) AsyncStorage.setItem(SHOP_ID_KEY, shopId);
        else AsyncStorage.removeItem(SHOP_ID_KEY);
    }, [shopId, isInitialized]);

    const calculateState = (currentItems) => {
        const totalCost = currentItems.reduce((sum, i) => sum + i.cost, 0);
        const newCounts = currentItems.reduce((acc, i) => {
            const key = (i.type || 'other').toLowerCase();
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, { vegetable: 0, fruit: 0, other: 0 });
        setKitty(configRef.current.initial_kitty - totalCost);
        setCounts(newCounts);
    };

    const refreshItems = async (sId) => {
        const { data, error } = await supabase
            .from('TheShop')
            .select(`TheShopID, Cost, Item:ItemID (ItemName, ItemType:ItemTypeID (ItemTypeName))`)
            .eq('ShopID', sId);

        if (error) { console.error('[REFRESH]', error); return; }

        const mapped = data.map(row => ({
            id: row.TheShopID,
            name: row.Item?.ItemName || 'Unknown',
            type: row.Item?.ItemType?.ItemTypeName?.toLowerCase() || 'other',
            cost: row.Cost,
        }));

        setItems(mapped);
        calculateState(mapped);
    };

    const seedReferenceData = async () => {
        const { data: types } = await supabase.from('ItemType').select('*');
        if (!types || types.length === 0) {
            await supabase.from('ItemType').insert([
                { ItemTypeName: 'vegetable', ItemTypeAbbrev: 'V' },
                { ItemTypeName: 'fruit', ItemTypeAbbrev: 'F' },
                { ItemTypeName: 'other', ItemTypeAbbrev: 'O' },
            ]);
        }
    };

    const fuzzyMatch = (input, candidates, threshold = 0.75) => {
        const norm = s => s.toLowerCase().trim().replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');
        const ni = norm(input);

        const levenshtein = (a, b) => {
            const dp = Array.from({ length: a.length + 1 }, (_, i) =>
                Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
            );
            for (let i = 1; i <= a.length; i++)
                for (let j = 1; j <= b.length; j++)
                    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
                        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
            return dp[a.length][b.length];
        };

        let best = null, bestScore = 0;
        for (const c of candidates) {
            const nc = norm(c.ItemName);
            if (nc === ni) return { match: c, score: 1 };
            const maxLen = Math.max(ni.length, nc.length);
            const score = maxLen === 0 ? 1 : 1 - levenshtein(ni, nc) / maxLen;
            if (score > bestScore) { bestScore = score; best = c; }
        }
        return bestScore >= threshold ? { match: best, score: bestScore } : null;
    };

    const resolveItemType = async (typeName) => {
        const typeMap = {
            'v': 'vegetable', 'veg': 'vegetable', 'vegetable': 'vegetable',
            'f': 'fruit', 'fruit': 'fruit',
            'o': 'other', 'other': 'other',
        };
        const dbName = typeMap[typeName.toLowerCase().trim()] || typeName;
        const { data } = await supabase.from('ItemType').select('ItemTypeID').ilike('ItemTypeName', dbName).maybeSingle();
        return data?.ItemTypeID || null;
    };

    const resolveOrCreateItem = async (name, typeName) => {
        const { data: allItems } = await supabase.from('Item').select('ItemID, ItemName');
        const fuzzy = allItems ? fuzzyMatch(name, allItems) : null;

        if (fuzzy) {
            return { itemId: fuzzy.match.ItemID, resolvedName: fuzzy.match.ItemName };
        }

        const typeId = await resolveItemType(typeName);
        if (!typeId) throw new Error(`Unknown type: ${typeName}`);

        const { data: newItem, error } = await supabase
            .from('Item')
            .insert([{ ItemName: name.toLowerCase().trim(), ItemTypeID: typeId }])
            .select().single();

        if (error) throw error;
        return { itemId: newItem.ItemID, resolvedName: newItem.ItemName };
    };

    const addItemToShop = async (sId, name, type, cost) => {
        const { itemId, resolvedName } = await resolveOrCreateItem(name, type);
        await supabase.from('TheShop').insert([{ ShopID: sId, ItemID: itemId, Cost: cost }]);
        return resolvedName;
    };

    const ensureSession = async () => {
        if (shopIdRef.current) return shopIdRef.current;
        const stored = await AsyncStorage.getItem(SHOP_ID_KEY);
        if (stored) {
            shopIdRef.current = stored;
            setShopId(stored);
            return stored;
        }
        return await startSession();
    };

    const startSession = async () => {
        await seedReferenceData();
        const { data: shop, error } = await supabase
            .from('Shop')
            .insert([{ PersonID: null, ShopDate: new Date().toISOString() }])
            .select().single();

        if (error || !shop) { console.error('Failed to create shop', error); return null; }

        const newShopId = String(shop.ShopID);
        shopIdRef.current = newShopId;
        setShopId(newShopId);
        setItems([]);

        try {
            await addItemToShop(newShopId, 'Parking', 'other', configRef.current.parking_cost);
            await addItemToShop(newShopId, 'Trolley', 'other', configRef.current.trolley_cost);
        } catch (e) {
            console.error('Error adding default items:', e);
        }

        await refreshItems(newShopId);
        return newShopId;
    };

    const addItem = async (name, type, cost) => {
        const currentShopId = shopIdRef.current || shopId;
        if (!currentShopId) return { error: 'No active shop. Tap Start Shop first.' };

        try {
            const resolvedName = await addItemToShop(currentShopId, name, type, parseFloat(cost));
            await refreshItems(currentShopId);
            return { resolvedName };
        } catch (e) {
            console.error('Error adding item:', e);
            return { error: 'Failed to add item.' };
        }
    };

    const deleteItem = async (name) => {
        const itemToDelete = items.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (!itemToDelete) return false;

        const { error } = await supabase.from('TheShop').delete().eq('TheShopID', itemToDelete.id);
        if (!error) {
            await refreshItems(shopIdRef.current || shopId);
            return true;
        }
        return false;
    };

    const closeSession = async (finalPersonId) => {
        const currentShopId = shopIdRef.current || shopId;
        if (!currentShopId) return;

        if (finalPersonId) {
            await supabase.from('Shop').update({ PersonID: finalPersonId }).eq('ShopID', currentShopId);
        }

        shopIdRef.current = null;
        setShopId(null);
        setItems([]);
        setKitty(configRef.current.initial_kitty);
        setCounts({ vegetable: 0, fruit: 0, other: 0 });
        await AsyncStorage.removeItem(SHOP_ID_KEY);
    };

    return {
        items, kitty, counts, sessionId: shopId,
        startSession, addItem, deleteItem, closeSession,
        people, personId, setPersonId,
    };
}
