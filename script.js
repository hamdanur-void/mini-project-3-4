
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const statusMessage = document.getElementById("status");
const weatherSection = document.getElementById("weather-section");
const favoriteButton = document.getElementById("favorite-button");
const favoritesList = document.getElementById("favorites-list");

let currentCity = null;
let favorites = JSON.parse(localStorage.getItem("skycast-favorites")) || [];

const weatherDescriptions = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"], 45: ["Fog", "🌫️"], 48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Moderate drizzle", "🌦️"], 55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"], 63: ["Moderate rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  71: ["Slight snowfall", "🌨️"], 73: ["Moderate snowfall", "🌨️"], 75: ["Heavy snowfall", "❄️"],
  80: ["Rain showers", "🌦️"], 81: ["Moderate rain showers", "🌧️"], 82: ["Violent rain showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm with hail", "⛈️"], 99: ["Thunderstorm with heavy hail", "⛈️"]
};


searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    showStatus("Please enter a city name first.", true);
    cityInput.focus();
    return;
  }

  await searchCity(city);
});

async function searchCity(city) {
  setLoading(true);
  showStatus("Searching for " + city + "...");
  weatherSection.classList.add("hidden");

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Could not connect to the location service.");

    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("No city found. Check the spelling and try again.");
    }

    const place = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("Weather data is temporarily unavailable.");

    const weatherData = await weatherResponse.json();
    currentCity = {
      name: place.name,
      country: place.country || "",
      latitude: place.latitude,
      longitude: place.longitude
    };

    renderWeather(currentCity, weatherData.current);
    showStatus("");
  } catch (error) {
    showStatus(error.message || "Something went wrong. Please try again.", true);
  } finally {
    setLoading(false);
  }
}

function renderWeather(place, current) {
  const condition = weatherDescriptions[current.weather_code] || ["Unknown conditions", "🌡️"];
  document.getElementById("location-name").textContent =
    place.name + (place.country ? ", " + place.country : "");
  document.getElementById("local-time").textContent =
    "Local time: " + current.time.replace("T", " ");
  document.getElementById("temperature").textContent = Math.round(current.temperature_2m);
  document.getElementById("weather-description").textContent = condition[0];
  document.getElementById("weather-symbol").textContent = condition[1];
  document.getElementById("feels-like").textContent = Math.round(current.apparent_temperature) + "°C";
  document.getElementById("humidity").textContent = current.relative_humidity_2m + "%";
  document.getElementById("wind").textContent = current.wind_speed_10m + " km/h";
  document.getElementById("metric-feels").textContent = Math.round(current.apparent_temperature) + "°C";

  updateFavoriteButton();
  weatherSection.classList.remove("hidden");
}

favoriteButton.addEventListener("click", () => {
  if (!currentCity) return;

  const exists = favorites.some(city =>
    city.name.toLowerCase() === currentCity.name.toLowerCase() &&
    city.country.toLowerCase() === currentCity.country.toLowerCase()
  );

  if (exists) {
    favorites = favorites.filter(city =>
      !(city.name.toLowerCase() === currentCity.name.toLowerCase() &&
        city.country.toLowerCase() === currentCity.country.toLowerCase())
    );
  } else {
    favorites.push(currentCity);
  }

  saveFavorites();
  renderFavorites();
  updateFavoriteButton();
});

function updateFavoriteButton() {
  if (!currentCity) return;
  const isSaved = favorites.some(city =>
    city.name.toLowerCase() === currentCity.name.toLowerCase() &&
    city.country.toLowerCase() === currentCity.country.toLowerCase()
  );
  favoriteButton.classList.toggle("saved", isSaved);
  favoriteButton.innerHTML = isSaved ? "★ <span>Saved</span>" : "☆ <span>Save city</span>";
  favoriteButton.setAttribute("aria-label", isSaved ? "Remove city from favorites" : "Save city to favorites");
}

function saveFavorites() {
  localStorage.setItem("skycast-favorites", JSON.stringify(favorites));
}

function renderFavorites() {
  document.getElementById("favorite-count").textContent =
    favorites.length + (favorites.length === 1 ? " saved" : " saved");

  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p class="empty-favorites">Your saved cities will appear here.</p>';
    return;
  }

  favoritesList.innerHTML = favorites.map((city, index) => `
    <div class="favorite-card">
      <button class="favorite-city" type="button" data-index="${index}">
        ${escapeHTML(city.name)}${city.country ? ", " + escapeHTML(city.country) : ""}
      </button>
      <button class="remove-favorite" type="button" data-remove="${index}" aria-label="Remove ${escapeHTML(city.name)}">×</button>
    </div>
  `).join("");

  favoritesList.querySelectorAll("[data-index]").forEach(button => {
    button.addEventListener("click", () => {
      const city = favorites[Number(button.dataset.index)];
      searchCity(city.name);
    });
  });

  favoritesList.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.remove);
      favorites = favorites.filter((city, i) => i !== index);
      saveFavorites();
      renderFavorites();
      updateFavoriteButton();
    });
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  searchButton.disabled = isLoading;
  searchButton.innerHTML = isLoading ? "Loading..." : 'Search <span>→</span>';
}

renderFavorites();

searchCity("Dhaka");
