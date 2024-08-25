document.getElementById('generate-booster').addEventListener('click', generateBooster);

function getRandomScryfallSyntax() {
    const ID = ['w', 'u', 'b', 'g', 'r', 'c', 'wu', 'wb', 'wg', 'wr', 'ub', 'ug', 'ur', 'bg', 'br', 'gr', 'wub', 'wub', 'wur', 'bgr', 'wubgr'];
    const colors = ['white', 'blue', 'black', 'red', 'green'];
    const types = ['creature', 'instant', 'sorcery', 'artifact', 'enchantment', 'planeswalker'];
    const rarities = ['common', 'uncommon', 'rare', 'mythic'];
    const sets = ['khm', 'znr', 'm21', 'iko', 'thb']; // Example set codes
    const cmcs = [1, 2, 3, 4, 5, 6, 7]; // Example converted mana costs
    const powers = ['1', '2', '3', '4', '5', '6', '7', '*']; // Example powers
    const toughnesses = ['1', '2', '3', '4', '5', '6', '7', '*']; // Example toughnesses
    const keywords = ['flying', 'trample', 'lifelink', 'deathtouch', 'haste']; // Example keywords
    const formats = ['standard', 'modern', 'commander', 'legacy', 'vintage']; // Example formats
    const frameEffects = ['legendary', 'miracle', 'nyxtouched', 'draft', 'devoid']; // Example frame effects
    const watermarks = ['set', 'guild', 'clan', 'faction', 'planeswalker']; // Example watermarks
    const borders = ['black', 'white', 'silver', 'borderless']; // Example borders
    const games = ['paper', 'arena', 'mtgo']; // Example games
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'ru', 'zhs', 'zht']; // Example languages
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
    const randomSet = sets[Math.floor(Math.random() * sets.length)];
    const randomCmc = cmcs[Math.floor(Math.random() * cmcs.length)];
    const randomPower = powers[Math.floor(Math.random() * powers.length)];
    const randomToughness = toughnesses[Math.floor(Math.random() * toughnesses.length)];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    const randomFrameEffect = frameEffects[Math.floor(Math.random() * frameEffects.length)];
    const randomWatermark = watermarks[Math.floor(Math.random() * watermarks.length)];
    const randomBorder = borders[Math.floor(Math.random() * borders.length)];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    const randomID = ID[Math.floor(Math.random() * ID.length)];
    const queries = [
        `id:${randomID}`,
        `color:${randomColor}`,
        `type:${randomType}`,
        `rarity:${randomRarity}`,
        `set:${randomSet}`,
        `cmc=${randomCmc}`,
        `power=${randomPower}`,
        `toughness=${randomToughness}`,
        `keyword:${randomKeyword}`,
        `format:${randomFormat}`,
        `frame:${randomFrameEffect}`,
        `watermark:${randomWatermark}`,
        `border:${randomBorder}`,
        `game:${randomGame}`,
        `lang:${randomLanguage}`,
        `name:/.*${randomKeyword}.*/`, // Regex for card name containing the keyword
        `oracle:/.*${randomKeyword}.*/`, // Regex for oracle text containing the keyword
        `artist:/.*${randomKeyword}.*/`, // Regex for artist name containing the keyword
        `flavor:/.*${randomKeyword}.*/` // Regex for flavor text containing the keyword
    ];
    // Combine random queries
    const randomQuery = queries.sort(() => Math.random() - 0.5).slice(0, 3).join(' ');
    return randomQuery;
}

async function generateBooster() {
    const userSyntax = document.getElementById('scryfall-syntax').value.trim();
    const syntax = userSyntax || getRandomScryfallSyntax();
    const quantity = parseInt(document.getElementById('result-quantity').value, 10);
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(syntax)}`;
    // Display the used Scryfall syntax in the text area
    document.getElementById('used-syntax').value = syntax;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const cards = data.data;
        // Shuffle the cards array
        cards.sort(() => Math.random() - 0.5);
        // Clear previous results
        document.getElementById('card-names').innerHTML = '';
        document.getElementById('card-images').innerHTML = '';
        // Display the results
        cards.slice(0, quantity).forEach(card => {
            const listItem = document.createElement('li');
            listItem.textContent = card.name;
            document.getElementById('card-names').appendChild(listItem);
            const img = document.createElement('img');
            img.src = card.image_uris.normal;
            img.alt = card.name;
            document.getElementById('card-images').appendChild(img);
        });
    } catch (error) {
        console.error('Error fetching data from Scryfall API:', error);
    }
}
