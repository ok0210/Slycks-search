async function search() {
    let query = document.getElementById("searchBox").value.trim().toLowerCase();
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!query) {
        resultsDiv.innerHTML = "<p style='color: red; font-weight: bold;'>Please enter a search term.</p>";
        return;
    }

    if (query.includes(".") || query.startsWith("http")) {
        openInBrowser(query.startsWith("http") ? query : "https://" + query);
        return;
    }

    let wikipediaUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    try {
        const wikiResponse = await fetch(wikipediaUrl);
        if (!wikiResponse.ok) throw new Error("Failed to fetch Wikipedia data");

        const wikiData = await wikiResponse.json();

        resultsDiv.innerHTML += `<div class="search-result">
            <h2>${wikiData.title} (Wikipedia)</h2>
            <p>${wikiData.extract}</p>
            <a href="#" onclick="openInBrowser('${wikiData.content_urls.desktop.page}')">Read more</a>
        </div>`;

    } catch (error) {
        resultsDiv.innerHTML += "<p style='color: red; font-weight: bold;'>No Wikipedia results found.</p>";
    }

    try {
        const response = await fetch("https://raw.githubusercontent.com/ok0210/Slycks-search/main/data.json");
        if (!response.ok) throw new Error("Error fetching database.");

        const database = await response.json();
        if (!database || database.length === 0) throw new Error("No results available.");

        let filteredResults = database.filter(item =>
            item.text.toLowerCase().includes(query) || item.title.toLowerCase().includes(query));

        resultsDiv.innerHTML += filteredResults.length === 0
            ? "<p style='color: red; font-weight: bold;'>No results found.</p>"
            : filteredResults.map(item => `
                <div class="search-result">
                    <p><a href="#" onclick="openInBrowser('${item.url}')">${item.title}</a></p>
                    <p>${item.text.substring(0, 200)}...</p>
                </div>`).join("");

    } catch (error) {
        resultsDiv.innerHTML += `<p style='color: red; font-weight: bold;'>Error loading results: ${error.message}</p>`;
    }
}

function openInBrowser(url) {
    if (window.location.href.includes("slycks-browser")) {
        fetch(`http://localhost:5000/open?url=${encodeURIComponent(url)}`);
    } else {
        window.location.href = url; 
    }
}

function handleKeyPress(event) {
    if (event.key === "Enter") search();
}
