let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    category: "Inspirational",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    category: "Motivational",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
];

// Load last selected category from local storage
const lastSelectedCategory =
  localStorage.getItem("lastSelectedCategory") || "all";
document.getElementById("categoryFilter").value = lastSelectedCategory;

// Simulated server endpoint for posting data
const serverUrl = "https://jsonplaceholder.typicode.com/posts"; // Mock API

// Function to fetch quotes from the simulated server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map((item) => ({
      text: item.title,
      category: "Server", // Default category for simulation
    }));
    return serverQuotes;
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

// Function to post a new quote to the server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quote),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    console.log("Quote posted successfully:", data);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// Sync quotes with the server periodically
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const mergedQuotes = mergeQuotes(quotes, serverQuotes);
  if (mergedQuotes) {
    quotes = mergedQuotes;
    saveQuotes();
    displayNotification("Quotes synced with server!"); // Notification added here
  }
}

// Merge local quotes with server quotes
function mergeQuotes(localQuotes, serverQuotes) {
  const updatedQuotes = [...localQuotes];

  serverQuotes.forEach((serverQuote) => {
    const existingIndex = updatedQuotes.findIndex(
      (localQuote) => localQuote.text === serverQuote.text
    );
    if (existingIndex === -1) {
      updatedQuotes.push(serverQuote);
    } else {
      updatedQuotes[existingIndex] = serverQuote;
      displayNotification(`Conflict resolved for quote: "${serverQuote.text}"`);
    }
  });

  return updatedQuotes;
}

// Function to display notification
function displayNotification(message) {
  const notificationElement = document.getElementById("notification");
  notificationElement.textContent = message;
  setTimeout(() => {
    notificationElement.textContent = ""; // Clear message after a few seconds
  }, 3000);
}

// Function to show quotes based on the selected category
function displayQuotes(category = "all") {
  const filteredQuotes =
    category === "all" ? quotes : quotes.filter((q) => q.category === category);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML =
      "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById(
    "quoteDisplay"
  ).innerHTML = `"${quote.text}" - <strong>${quote.category}</strong>`;
}

// Function to show a random quote
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  displayQuotes(selectedCategory);
}

// Function to populate categories in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map((q) => q.category))];

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);
  displayQuotes(selectedCategory);
}

// Function to create a new quote
async function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value;
  const quoteCategory = document.getElementById("newQuoteCategory").value;

  if (quoteText && quoteCategory) {
    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
    await postQuoteToServer(newQuote); // Post quote to server
    saveQuotes(); // Save quotes to local storage
    updateCategories(quoteCategory);
    document.getElementById("newQuoteText").value = ""; // Clear input field
    document.getElementById("newQuoteCategory").value = ""; // Clear input field
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields.");
  }
}

// Update categories in the dropdown if a new category is introduced
function updateCategories(newCategory) {
  const categoryFilter = document.getElementById("categoryFilter");
  const existingCategories = [...categoryFilter.options].map(
    (option) => option.value
  );

  if (!existingCategories.includes(newCategory)) {
    const option = document.createElement("option");
    option.value = newCategory;
    option.textContent = newCategory;
    categoryFilter.appendChild(option);
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Export quotes to JSON file
function exportToJson() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
    populateCategories();
    displayQuotes();
  };
}

// Call the functions when the page loads
window.onload = function () {
  populateCategories(); // Populate categories
  showRandomQuote(); // Show a random quote based on the last selected category
  setInterval(syncQuotes, 30000); // Sync with server every 30 seconds
};

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteButton").addEventListener("click", addQuote);
document.getElementById("exportButton").addEventListener("click", exportToJson);