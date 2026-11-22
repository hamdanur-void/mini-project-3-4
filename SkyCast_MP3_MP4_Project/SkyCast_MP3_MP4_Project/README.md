# SkyCast — MP3 & MP4 Mini Project

A responsive, API-driven weather dashboard built with HTML, CSS and JavaScript.

## Run the project
1. Extract the ZIP file.
2. Open the `weather_dashboard_mp3_mp4` folder.
3. Open `index.html` in a browser. If your browser restricts local requests, use VS Code Live Server.
4. Search for a city, then press **Save city** to add it to favorites.

## Features
- Search worldwide cities using Open-Meteo Geocoding API.
- Retrieve current weather using Open-Meteo Forecast API.
- Dynamic DOM rendering and weather condition icons.
- Loading, error and empty states.
- Save and remove favorite cities using `localStorage`.
- Favorites remain after refreshing the browser.

## Assignment mapping
- **MP3 — DOM Manipulation (4):** `getElementById`, `querySelectorAll`, `textContent`, `innerHTML`, `classList`, dynamic rendering.
- **MP3 — Event Handling & Logic (3):** `addEventListener`, arrays, objects, `map`, `filter`, `forEach`, `some`.
- **MP4 — API & Async Operations (4):** `fetch`, `async/await`, JSON, loading and error handling.
- **MP4 — Local Storage (3):** `localStorage.getItem`, `setItem`.

## APIs
- Geocoding: https://geocoding-api.open-meteo.com/v1/search
- Weather: https://api.open-meteo.com/v1/forecast

No API key is required. An internet connection is required.

## Before submission
- Test multiple cities and an invalid city name.
- Test saving/removing favorites and refreshing the page.
- Add your own name, ID and course details if your instructor requires them.
- Push the project to your GitHub repository and submit the repository URL and ZIP file as instructed.
