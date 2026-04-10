/**
 * @file Booster Generator — Scryfall API-powered random booster packs
 * @description Generates random MTG booster packs using the Scryfall search API.
 *
 * Hooks emitted:
 * - H50:BoosterGenerated — after a booster pack is generated
 * - H52:ApiRequest — on each Scryfall API call
 */

/* ---------- Constants & Configuration ---------- */

const SCRYFALL_SEARCH_URL = "https://api.scryfall.com/cards/search";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 10000;

const QUERY_POOLS = {
    id: ["w", "u", "b", "g", "r", "c", "wu", "wb", "wg", "wr", "ub", "ug", "ur", "bg", "br", "gr", "wub", "wur", "bgr", "wubgr"],
    colors: ["white", "blue", "black", "red", "green"],
    types: ["creature", "instant", "sorcery", "artifact", "enchantment", "planeswalker"],
    rarities: ["common", "uncommon", "rare", "mythic"],
    sets: ["khm", "znr", "m21", "iko", "thb"],
    cmcs: [1, 2, 3, 4, 5, 6, 7],
    powers: ["1", "2", "3", "4", "5", "6", "7", "*"],
    toughnesses: ["1", "2", "3", "4", "5", "6", "7", "*"],
    keywords: ["flying", "trample", "lifelink", "deathtouch", "haste"],
    formats: ["standard", "modern", "commander", "legacy", "vintage"],
    frameEffects: ["legendary", "miracle", "nyxtouched", "draft", "devoid"],
    watermarks: ["set", "guild", "clan", "faction", "planeswalker"],
    borders: ["black", "white", "silver", "borderless"],
    games: ["paper", "arena", "mtgo"],
    languages: ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "ru", "zhs", "zht"]
};

/* ---------- Utility Functions ---------- */

/**
 * Pick a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Sleep for the specified number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ---------- Scryfall API ---------- */

/**
 * Build a random Scryfall search query from the query pools.
 * @returns {string} A Scryfall search syntax string
 */
function getRandomScryfallSyntax() {
    const keyword = randomChoice(QUERY_POOLS.keywords);
    const queries = [
        `id:${randomChoice(QUERY_POOLS.id)}`,
        `color:${randomChoice(QUERY_POOLS.colors)}`,
        `type:${randomChoice(QUERY_POOLS.types)}`,
        `rarity:${randomChoice(QUERY_POOLS.rarities)}`,
        `set:${randomChoice(QUERY_POOLS.sets)}`,
        `cmc=${randomChoice(QUERY_POOLS.cmcs)}`,
        `power=${randomChoice(QUERY_POOLS.powers)}`,
        `toughness=${randomChoice(QUERY_POOLS.toughnesses)}`,
        `keyword:${keyword}`,
        `format:${randomChoice(QUERY_POOLS.formats)}`,
        `frame:${randomChoice(QUERY_POOLS.frameEffects)}`,
        `watermark:${randomChoice(QUERY_POOLS.watermarks)}`,
        `border:${randomChoice(QUERY_POOLS.borders)}`,
        `game:${randomChoice(QUERY_POOLS.games)}`,
        `lang:${randomChoice(QUERY_POOLS.languages)}`,
        `name:/.*${keyword}.*/`,
        `oracle:/.*${keyword}.*/`,
        `artist:/.*${keyword}.*/`,
        `flavor:/.*${keyword}.*/`
    ];

    return shuffleArray(queries).slice(0, 3).join(" ");
}

/**
 * Fetch JSON from a URL with retry logic.
 * @param {string} url
 * @param {number} [retries=MAX_RETRIES]
 * @returns {Promise<Object>}
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            const startTime = performance.now();
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            const duration = Math.round(performance.now() - startTime);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            // H52:ApiRequest hook (dispatched as custom event)
            document.dispatchEvent(new CustomEvent("hook:H52:ApiRequest", {
                detail: { url, method: "GET", status: response.status, duration }
            }));
            return data;
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                await sleep(RETRY_DELAY_MS * attempt);
            }
        }
    }
    throw new Error(`Request failed after ${retries} attempts: ${lastError.message}`);
}

/* ---------- UI State Management ---------- */

/**
 * Show or hide the loading state.
 * @param {boolean} loading
 */
function setLoadingState(loading) {
    const btn = document.getElementById("generate-booster");
    if (btn) {
        btn.disabled = loading;
        btn.textContent = loading ? "Generating..." : "Generate Booster";
    }
}

/**
 * Display an error message to the user.
 * @param {string} message
 */
function showError(message) {
    const cardNames = document.getElementById("card-names");
    const cardImages = document.getElementById("card-images");
    if (cardNames) cardNames.innerHTML = "";
    if (cardImages) {
        cardImages.innerHTML = `<p style="color: #ff6b6b; padding: 1rem;">${message}</p>`;
    }
}

/**
 * Clear previous results from the display.
 */
function clearResults() {
    const cardNames = document.getElementById("card-names");
    const cardImages = document.getElementById("card-images");
    if (cardNames) cardNames.innerHTML = "";
    if (cardImages) cardImages.innerHTML = "";
}

/**
 * Render a single card into the results.
 * @param {Object} card - Scryfall card object
 */
function renderCard(card) {
    const cardNames = document.getElementById("card-names");
    const cardImages = document.getElementById("card-images");

    if (cardNames) {
        const listItem = document.createElement("li");
        listItem.textContent = card.name;
        cardNames.appendChild(listItem);
    }

    if (cardImages) {
        const img = document.createElement("img");
        // Handle double-faced cards
        img.src = card.image_uris
            ? card.image_uris.normal
            : (card.card_faces && card.card_faces[0].image_uris
                ? card.card_faces[0].image_uris.normal
                : "");
        img.alt = card.name;
        img.loading = "lazy";
        cardImages.appendChild(img);
    }
}

/* ---------- Main Generation Logic ---------- */

/**
 * Generate a booster pack by fetching cards from Scryfall.
 * Handles error states, loading UI, and result rendering.
 */
async function generateBooster() {
    const syntaxInput = document.getElementById("scryfall-syntax");
    const quantityInput = document.getElementById("result-quantity");
    const usedSyntaxDisplay = document.getElementById("used-syntax");

    const userSyntax = syntaxInput ? syntaxInput.value.trim() : "";
    const syntax = userSyntax || getRandomScryfallSyntax();
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) || 10 : 10;
    const url = `${SCRYFALL_SEARCH_URL}?q=${encodeURIComponent(syntax)}`;

    if (usedSyntaxDisplay) {
        usedSyntaxDisplay.value = syntax;
    }

    setLoadingState(true);
    clearResults();

    try {
        const data = await fetchWithRetry(url);

        if (!data.data || data.data.length === 0) {
            showError("No cards found for the given search criteria. Try different syntax.");
            return;
        }

        const cards = shuffleArray([...data.data]);
        cards.slice(0, quantity).forEach(renderCard);

        // H50:BoosterGenerated hook
        document.dispatchEvent(new CustomEvent("hook:H50:BoosterGenerated", {
            detail: { syntax, cardCount: Math.min(quantity, cards.length), success: true }
        }));
    } catch (error) {
        console.error("Error fetching data from Scryfall API:", error);
        showError(`Failed to generate booster: ${error.message}. Please try again.`);

        document.dispatchEvent(new CustomEvent("hook:H50:BoosterGenerated", {
            detail: { syntax, cardCount: 0, success: false }
        }));
    } finally {
        setLoadingState(false);
    }
}

/* ---------- Event Binding ---------- */

document.getElementById("generate-booster").addEventListener("click", generateBooster);
