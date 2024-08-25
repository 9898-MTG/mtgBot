// Improved JS
const generatePackButton = document.getElementById('generatePack');
const boosterPackContainer = document.getElementById('boosterPack');

const apiUrls = [
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=white',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=white',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=blue',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=blue',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=black',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=black',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=red',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=red',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=green',
    'https://api.scryfall.com/cards/random?q=format=commander+rarity=common+id=green',
    'https://api.scryfall.com/cards/random?q=format=commander+(rarity=rare+OR+rarity=mythic)',
    'https://api.scryfall.com/cards/random?q=format=commander+(rarity=rare+OR+rarity=mythic)',
    'https://api.scryfall.com/cards/random?q=format=historic',
    'https://api.scryfall.com/cards/random?q=format=historic',
    'https://api.scryfall.com/cards/random?q=format=standard',
    'https://api.scryfall.com/cards/random?q=format=standard',
    'https://api.scryfall.com/cards/random?q=t=legendary+t=creature',
    'https://api.scryfall.com/cards/random?q=t=legendary+t=creature',
];

async function fetchCard(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data.image_uris?.normal || data.card_faces[0].image_uris.normal;
}

async function generateBoosterPack() {
    boosterPackContainer.innerHTML = '';
    generatePackButton.disabled = true;

    try {
        const cardPromises = apiUrls.map(fetchCard);
        const cardImages = await Promise.all(cardPromises);

        cardImages.forEach((imageUrl) => {
            const cardElement = document.createElement('img');
            cardElement.src = imageUrl;
            cardElement.alt = 'MTG Card';
            cardElement.className = 'card';
            boosterPackContainer.appendChild(cardElement);
        });
    } catch (error) {
        console.error('Error generating booster pack:', error);
        alert('An error occurred while generating the booster pack. Please try again.');
    } finally {
        generatePackButton.disabled = false;
    }
}

generatePackButton.addEventListener('click', generateBoosterPack);