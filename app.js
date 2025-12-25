const API_URL = "https://kimiquotes.pages.dev/api/quote";

const container = document.getElementById("reelsContainer");
const autoScrollButton = document.getElementById("autoScrollButton");
const loadingIndicator = document.getElementById("loadingIndicator");

let quotes = [];
let quoteIds = new Set();
let preloadedQuotes = [];
const PRELOAD_BUFFER = 1;
let currentIndex = 0;

async function fetchQuote() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const newQuote = {
      id: data.id,
      text: data.quote,
    };

    if (!quoteIds.has(newQuote.id)) {
      return newQuote;
    }
    return null;
  } catch (err) {
    console.error("Error fetching quote:", err);
    return null;
  }
}

async function preloadQuotes() {
  while (preloadedQuotes.length < PRELOAD_BUFFER) {
    const quote = await fetchQuote();
    if (quote) {
      preloadedQuotes.push(quote);
      quoteIds.add(quote.id);
    }
  }
}

async function getNextQuote() {
  if (preloadedQuotes.length === 0) {
    if (loadingIndicator) loadingIndicator.style.display = "block";
    await preloadQuotes();
    if (loadingIndicator) loadingIndicator.style.display = "none";
  }

  const quote = preloadedQuotes.shift();

  if (quote) {
    renderQuotes([quote]);
  }

  if (preloadedQuotes.length < PRELOAD_BUFFER) {
    preloadQuotes();
  }
}

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

function renderQuotes(newQuotes) {
  const fragment = document.createDocumentFragment();

  newQuotes.forEach((q) => {
    fragment.appendChild(createReelCard(q));
  });

  container.appendChild(fragment);
  quotes = quotes.concat(newQuotes);
}

function scrollToIndex(index) {
  const cards = container.querySelectorAll(".reel-card");
  if (cards[index]) {
    cards[index].scrollIntoView({ behavior: "smooth", block: "start" });
    currentIndex = index;
  }
}

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

      if (Math.abs(cardCenter - containerCenter) < cardRect.height / 2) {
        currentIndex = index;

        if (index >= cards.length - 2) {
          getNextQuote();
        }
      }
    });
  }, 100);
});

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
