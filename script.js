const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const emptyIcon = document.getElementById("emptyIcon");
const emptyHeading = document.getElementById("emptyHeading");
const emptyMessage = document.getElementById("emptyMessage");
const chips = document.querySelectorAll(".quick-picks button");
let latestSearchId = 0;

function showState({ heading, message, icon, isLoading = false, isError = false }) {
  emptyState.hidden = false;
  emptyState.classList.toggle("is-loading", isLoading);
  emptyState.classList.toggle("is-error", isError);
  emptyState.setAttribute("role", isError ? "alert" : "status");
  emptyHeading.textContent = heading;
  emptyMessage.textContent = message;
  emptyIcon.textContent = icon;
  emptyIcon.className = isLoading ? "empty-icon loading-spinner" : "empty-icon";
}

async function searchImages(query) {
  const searchId = ++latestSearchId;
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    "&generator=search&gsrnamespace=6&gsrlimit=20" +
    "&gsrsearch=" + encodeURIComponent(query + " filetype:bitmap") +
    "&prop=imageinfo&iiprop=url&iiurlwidth=400";

  results.replaceChildren();
  resultCount.textContent = "Searching for \"" + query + "\"…";
  results.setAttribute("aria-busy", "true");
  showState({
    heading: "Searching…",
    message: "Finding images for \"" + query + "\".",
    icon: "",
    isLoading: true
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Image search request failed with status " + response.status);
    }

    const data = await response.json();
    if (searchId !== latestSearchId) {
      return;
    }

    const pages = data.query ? Object.values(data.query.pages) : [];

    for (const page of pages) {
      const info = page.imageinfo[0];

      const card = document.createElement("a");
      card.className = "card";
      card.href = info.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = info.thumburl;
      img.alt = page.title;

      const title = document.createElement("p");
      title.textContent = page.title.replace("File:", "").replace(/\.\w+$/, "");

      card.appendChild(img);
      card.appendChild(title);
      results.appendChild(card);
    }

    resultCount.textContent = "Showing " + pages.length + " results for \"" + query + "\"";
    if (pages.length === 0) {
      showState({
        heading: "No results for that word.",
        message: "Try another search.",
        icon: "⌕"
      });
    } else {
      emptyState.hidden = true;
    }
  } catch (error) {
    if (searchId !== latestSearchId) {
      return;
    }
    console.error("Image search failed:", error);
    results.replaceChildren();
    resultCount.textContent = "Search unavailable";
    showState({
      heading: "Something went wrong.",
      message: "Please try again.",
      icon: "!"
    });
  } finally {
    if (searchId === latestSearchId) {
      results.removeAttribute("aria-busy");
    }
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (query === "") {
    return;
  }
  searchImages(query);
});

// Enhancement: quick-pick chips run a search.
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent;
    searchImages(chip.textContent);
  });
});
