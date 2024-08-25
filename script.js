// Improved JS
// Improved JavaScript
// Get the menu element
const menu = document.getElementById('menu');

/**
 * Event listener for the 'change' event on the menu element.
 * When the user selects an option from the menu, this function retrieves the selected value,
 * validates it, and redirects the browser to the corresponding page.
 *
 * @param {Event} e - The event object representing the 'change' event.
 * @property {HTMLElement} e.target - The target element that triggered the event.
 * @property {string} e.target.value - The value of the selected option in the menu.
 */// Add event listener for change event
menu.addEventListener('change', (e) => {
	const selectedValue = e.target.value;

	// Validate selected value
	if (selectedValue) {
		// Redirect to the selected page
		window.location.href = `./${selectedValue}/index.html`;
	} else {
		console.error('Invalid selection');
	}
});
