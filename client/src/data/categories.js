/* =========================================================================
   PRODUCT CATEGORIES — single source of truth.

   The admin form writes one of these keys onto product.category, and the
   shop filters read it back. Both sides import from here so the two lists
   can't drift apart again — the shop used to filter on "tshirts", which no
   product is ever saved as, so the T-Shirts pill matched nothing.

   Matching runs on a normalised key ("T-Shirt", "t shirts", "T_Shirt" all
   collapse to the same token), so older or hand-entered values still land
   in the right bucket instead of quietly vanishing from every filter but
   "All Products". Anything we genuinely don't recognise falls into Others
   rather than disappearing.
   ========================================================================= */

export const ALL_KEY = 'all';
export const OTHERS_KEY = 'others';

/* Order here is the order the filter pills render in. */
export const CATEGORY_TREE = [
    {
        key: 'tshirts',
        label: 'T-Shirts',
        aliases: ['tee', 'tees', 'tshirt', 'graphic tee'],
        children: [
            { key: 'unique', label: 'Unique', aliases: ['unique prints', 'unique tees', 'graphic'] },
            { key: 'formal', label: 'Official', aliases: ['official', 'official prints', 'official tees'] },
        ],
    },
    { key: 'shirts', label: 'Shirts', aliases: ['casual shirt', 'button down', 'button up'] },
    { key: 'pants', label: 'Pants', aliases: ['trousers', 'bottoms', 'joggers'] },
    { key: 'caps', label: 'Caps', aliases: ['hats', 'headwear'] },
    { key: 'hoodies', label: 'Hoodies', aliases: ['hoody', 'hooded sweatshirt'] },
    // 'sweaters'/'pullovers' share this bucket — the shop has no separate
    // knitwear category. Drop them from the aliases if that ever changes.
    { key: 'sweatshirts', label: 'Sweatshirts', aliases: ['sweaters', 'pullovers', 'crew neck'] },
];

/* ---------- Normalising ---------- */
/* "T-Shirts" / "t shirts" / "T_Shirt" -> "tshirts" / "tshirt" */
const normalize = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const singularize = (value) => (value.length > 3 && value.endsWith('s') ? value.slice(0, -1) : value);

/* normalised token -> canonical category key */
const LOOKUP = new Map();
/* canonical key -> its display label */
const LABELS = new Map();
/* child key -> parent key (so the T-Shirts pill also catches Unique + Official) */
const PARENT_OF = new Map();

function register(token, key) {
    const token_ = normalize(token);
    if (!token_) return;
    // First registration wins, so a key is never shadowed by another node's alias.
    if (!LOOKUP.has(token_)) LOOKUP.set(token_, key);
    const singular = singularize(token_);
    if (!LOOKUP.has(singular)) LOOKUP.set(singular, key);
}

function registerNode(node, parentKey) {
    LABELS.set(node.key, node.label);
    if (parentKey) PARENT_OF.set(node.key, parentKey);
    register(node.key, node.key);
    register(node.label, node.key);
    (node.aliases || []).forEach((alias) => register(alias, node.key));
    (node.children || []).forEach((child) => registerNode(child, node.key));
}

CATEGORY_TREE.forEach((node) => registerNode(node, null));

/* ---------- Public helpers ---------- */

/**
 * Canonical key for whatever is stored on a product ('formal', 'caps', …),
 * or null when the value is empty or unrecognised.
 */
export function resolveCategory(rawCategory) {
    const token = normalize(rawCategory);
    if (!token) return null;
    return LOOKUP.get(token) ?? LOOKUP.get(singularize(token)) ?? null;
}

/**
 * Does a product belong under the given filter pill?
 * A parent pill ('tshirts') matches all of its children ('unique', 'formal').
 */
export function matchesCategory(rawCategory, filterKey) {
    if (!filterKey || filterKey === ALL_KEY) return true;
    const key = resolveCategory(rawCategory);
    if (filterKey === OTHERS_KEY) return key === null;
    if (key === null) return false;
    return key === filterKey || PARENT_OF.get(key) === filterKey;
}

/** Display label for a stored category — 'formal' -> 'Official'. */
export function categoryLabel(rawCategory) {
    const key = resolveCategory(rawCategory);
    if (key) return LABELS.get(key);
    const trimmed = String(rawCategory ?? '').trim();
    return trimmed || 'Uncategorized';
}

/** Label including the parent — 'formal' -> 'T-Shirts - Official'. */
export function categoryPathLabel(rawCategory) {
    const key = resolveCategory(rawCategory);
    if (!key) return categoryLabel(rawCategory);
    const parentKey = PARENT_OF.get(key);
    return parentKey ? `${LABELS.get(parentKey)} - ${LABELS.get(key)}` : LABELS.get(key);
}

/** Options for the admin category <select> — leaves only, never a group. */
export const CATEGORY_OPTIONS = CATEGORY_TREE.flatMap((node) =>
    node.children
        ? node.children.map((child) => ({ value: child.key, label: `${node.label} - ${child.label}` }))
        : [{ value: node.key, label: node.label }],
);

export const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0].value;

const OPTION_VALUES = new Set(CATEGORY_OPTIONS.map((option) => option.value));

/**
 * Snap a stored value onto one the admin <select> can actually display, so
 * editing a legacy product ("T-Shirt", "Sweat Shirt") doesn't show an empty
 * Category box. A group key resolves to its first child.
 */
export function toFormCategory(rawCategory) {
    const key = resolveCategory(rawCategory);
    if (key && OPTION_VALUES.has(key)) return key;
    const firstChild = CATEGORY_TREE.find((node) => node.key === key)?.children?.[0]?.key;
    return firstChild ?? DEFAULT_CATEGORY;
}

/**
 * Filter pills for the shop. "Others" is only offered when there is actually
 * something uncategorised to show behind it.
 */
export function buildShopFilters(products = []) {
    const pills = [
        { key: ALL_KEY, label: 'All Products' },
        ...CATEGORY_TREE.map((node) => ({
            key: node.key,
            label: node.label,
            ...(node.children
                ? { subItems: node.children.map((child) => ({ key: child.key, label: child.label })) }
                : {}),
        })),
    ];

    const hasUncategorized = products.some((p) => resolveCategory(p.category) === null);
    return hasUncategorized ? [...pills, { key: OTHERS_KEY, label: 'Others' }] : pills;
}
