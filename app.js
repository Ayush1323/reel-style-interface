const API_URL = "https://kimiquotes.pages.dev/api/quote";
const container = document.getElementById("reelsContainer");
const autoScrollButton = document.getElementById("autoScrollButton");
const loadingIndicator = document.getElementById("loadingIndicator");

let preloadedQuotes = [];
const PRELOAD_BUFFER = 8;
let currentIndex = 0;

// Fetch a quote from the API
async function fetchQuote() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const newQuote = {
      id: data.id,
      text: data.quote,
    };

    return newQuote;
  } catch (err) {
    console.error("Error fetching quote:", err);
    return null;
  }
}

// Create a new reel card element
function createReelCard(quote) {
  const card = document.createElement("div");
  card.className = "reel-card";

  card.innerHTML = `
    <div class="quote-content">
      <div class="quote-text">"${quote.text}"</div>
    </div>
  `;

  return card;
}

// Render the quotes in the container of Created Reel Cards
function renderQuotes(newQuotes) {
  newQuotes.forEach((q) => {
    container.appendChild(createReelCard(q));
  });
}

// Preload quotes to maintain a buffer
async function preloadQuotes() {
  while (preloadedQuotes.length < PRELOAD_BUFFER) {
    const quote = await fetchQuote();
    if (quote) {
      preloadedQuotes.push(quote);
    }
  }
}

// Get the next quote and render it
async function getNextQuote() {
  const quote = preloadedQuotes.shift();

  if (quote) {
    renderQuotes([quote]);
  }

  if (preloadedQuotes.length < PRELOAD_BUFFER) {
    preloadQuotes();
  }
}

// Scroll event listener needs to detect the centered card
let isScrolling;
container.addEventListener("scroll", () => {
  clearTimeout(isScrolling);

  isScrolling = setTimeout(() => {
    const cards = container.querySelectorAll(".reel-card");
    const containerRect = container.getBoundingClientRect();

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.top + cardRect.height / 2;
      const containerCenter = containerRect.top + containerRect.height / 2;

      if (Math.ceil(cardCenter - containerCenter) < cardRect.height / 2) {
        currentIndex = index;

        if (index >= cards.length - 2) {
          getNextQuote();
        }
      }
    });
  }, 100);
});

// Initialize the app
async function init() {
  if (loadingIndicator) loadingIndicator.style.display = "block";

  await preloadQuotes();

  for (let i = 0; i < 3 && preloadedQuotes.length > 0; i++) {
    const quote = preloadedQuotes.shift();
    renderQuotes([quote]);
  }

  if (loadingIndicator) loadingIndicator.style.display = "none";

  preloadQuotes();
}

init();
