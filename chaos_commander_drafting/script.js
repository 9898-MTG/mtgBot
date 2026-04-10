/**
 * @file Chaos Commander Drafting — Interactive draft format UI
 * @description Generates a Chaos Commander booster pack by fetching random cards
 *              from the Scryfall API across multiple color/format categories.
 *
 * Hooks emitted:
 * - H51:DraftStarted — after a draft pack is generated
 * - H52:ApiRequest — on each Scryfall API call
 */

/* ---------- Constants & Configuration ---------- */

const SCRYFALL_RANDOM_URL = "https://api.scryfall.com/cards/random";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Draft pack configuration — each entry defines a Scryfall query for one card slot.
 * Categories are paired for balance (2 per color, 2 rares, 2 historic, 2 standard, 2 legendary).
 */
const DRAFT_SLOTS = [
    { query: "format=commander+rarity=common+id=white", label: "White Common" },
    { query: "format=commander+rarity=common+id=white", label: "White Common" },
    { query: "format=commander+rarity=common+id=blue", label: "Blue Common" },
    { query: "format=commander+rarity=common+id=blue", label: "Blue Common" },
    { query: "format=commander+rarity=common+id=black", label: "Black Common" },
    { query: "format=commander+rarity=common+id=black", label: "Black Common" },
    { query: "format=commander+rarity=common+id=red", label: "Red Common" },
    { query: "format=commander+rarity=common+id=red", label: "Red Common" },
    { query: "format=commander+rarity=common+id=green", label: "Green Common" },
    { query: "format=commander+rarity=common+id=green", label: "Green Common" },
    { query: "format=commander+(rarity=rare+OR+rarity=mythic)", label: "Rare/Mythic" },
    { query: "format=commander+(rarity=rare+OR+rarity=mythic)", label: "Rare/Mythic" },
    { query: "format=historic", label: "Historic" },
    { query: "format=historic", label: "Historic" },
    { query: "format=standard", label: "Standard" },
    { query: "format=standard", label: "Standard" },
    { query: "t=legendary+t=creature", label: "Legendary Creature" },
    { query: "t=legendary+t=creature", label: "Legendary Creature" }
];

/* ---------- Utility Functions ---------- */

/**
 * Sleep for the specified number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ---------- API Layer ---------- */

/**
 * Fetch a single random card from Scryfall with retry logic.
 * @param {string} query - Scryfall search query parameters
 * @returns {Promise<string>} Card image URL
 */
async function fetchCard(query) {
    const url = `${SCRYFALL_RANDOM_URL}?q=${query}`;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
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

            // H52:ApiRequest hook
            document.dispatchEvent(new CustomEvent("hook:H52:ApiRequest", {
                detail: { url, method: "GET", status: response.status, duration }
            }));

            // Handle double-faced cards
            return data.image_uris
                ? data.image_uris.normal
                : (data.card_faces && data.card_faces[0].image_uris
                    ? data.card_faces[0].image_uris.normal
                    : "");
        } catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAY_MS * attempt);
            }
        }
    }
    throw new Error(`Failed to fetch card after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

/* ---------- UI State Management ---------- */

const generatePackButton = document.getElementById("generatePack");
const boosterPackContainer = document.getElementById("boosterPack");

/**
 * Set the loading state of the generate button and display.
 * @param {boolean} loading
 */
function setLoadingState(loading) {
    if (generatePackButton) {
        generatePackButton.disabled = loading;
        generatePackButton.textContent = loading ? "Generating..." : "Generate Pack";
    }
}

/**
 * Display an error message in the pack container.
 * @param {string} message
 */
function showError(message) {
    if (boosterPackContainer) {
        const errorP = document.createElement("p");
        errorP.style.color = "#ff6b6b";
        errorP.style.padding = "1rem";
        errorP.textContent = message;
        boosterPackContainer.innerHTML = "";
        boosterPackContainer.appendChild(errorP);
    }
}

/**
 * Render a card image into the pack container.
 * @param {string} imageUrl - Card image URL
 * @param {string} label - Card slot label for alt text
 */
function renderCard(imageUrl, label) {
    if (!boosterPackContainer) return;
    const cardElement = document.createElement("img");
    cardElement.src = imageUrl;
    cardElement.alt = label || "MTG Card";
    cardElement.className = "card";
    cardElement.loading = "lazy";
    boosterPackContainer.appendChild(cardElement);
}

/* ---------- Main Draft Logic ---------- */

/**
 * Generate a complete Chaos Commander booster pack.
 * Fetches all cards in parallel, renders them, and emits the H51 hook.
 */
async function generateBoosterPack() {
    if (boosterPackContainer) {
        boosterPackContainer.innerHTML = "";
    }
    setLoadingState(true);

    let successCount = 0;
    let failCount = 0;

    try {
        const cardPromises = DRAFT_SLOTS.map(async (slot) => {
            try {
                const imageUrl = await fetchCard(slot.query);
                successCount++;
                return { imageUrl, label: slot.label, success: true };
            } catch (error) {
                failCount++;
                console.error(`Failed to fetch ${slot.label}:`, error.message);
                return { imageUrl: null, label: slot.label, success: false };
            }
        });

        const results = await Promise.all(cardPromises);

        results.forEach(result => {
            if (result.success && result.imageUrl) {
                renderCard(result.imageUrl, result.label);
            }
        });

        if (failCount > 0 && successCount === 0) {
            showError("Failed to generate booster pack. Please check your connection and try again.");
        } else if (failCount > 0) {
            // Partial success — show a warning
            const warning = document.createElement("p");
            warning.style.color = "#ffa500";
            warning.textContent = `${failCount} card(s) could not be loaded.`;
            if (boosterPackContainer) {
                boosterPackContainer.prepend(warning);
            }
        }

        // H51:DraftStarted hook
        document.dispatchEvent(new CustomEvent("hook:H51:DraftStarted", {
            detail: { cardCount: successCount, success: successCount > 0 }
        }));
    } catch (error) {
        console.error("Error generating booster pack:", error);
        showError("An error occurred while generating the booster pack. Please try again.");
    } finally {
        setLoadingState(false);
    }
}

/* ---------- Event Binding ---------- */

generatePackButton.addEventListener("click", generateBoosterPack);