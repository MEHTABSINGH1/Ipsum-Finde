const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const chips = document.querySelectorAll(".quick-picks button");

async function searchImages(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    "&generator=search&gsrnamespace=6&gsrlimit=20" +
    "&gsrsearch=" + encodeURIComponent(query + " filetype:bitmap") +
    "&prop=imageinfo&iiprop=url&iiurlwidth=400";

  const response = await fetch(url);
  if (!response.ok) {
    return;
  }

  const data = await response.json();
  const pages = data.query ? Object.values(data.query.pages) : [];

  results.innerHTML = "";

  for (const page of pages) {
    const info = page.imageinfo[0];

    const card = document.createElement("a");
    card.className = "card";
    card.href = info.url;
    card.target = "_blank";

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
  emptyState.style.display = pages.length ? "none" : "grid";
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
