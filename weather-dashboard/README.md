# Live Weather Dashboard

A complete front-end assignment for **Asynchronous JavaScript & RESTful APIs**.

## Requirements covered

- Fetches live data with the browser **Fetch API** and **async/await**.
- Uses a public REST API with no API key required: **Open-Meteo**.
- Searches for a city by name through the Open-Meteo geocoding REST endpoint.
- Fetches current temperature, relative humidity, wind speed, weather code, day/night state, timezone, and units.
- Handles HTTP failures, invalid JSON, empty search results, missing response data, and unexpected runtime errors.
- Parses nested JSON objects and dynamically renders the parsed response in the interface.
- Provides a responsive, modern dashboard for desktop and mobile screens.
- Includes quick-search city buttons and an initial live Bengaluru result.

## API flow

1. User enters a city name.
2. JavaScript sends an asynchronous request to the Open-Meteo geocoding endpoint.
3. The returned latitude and longitude are passed to the weather forecast endpoint.
4. The weather JSON is parsed with `response.json()`.
5. The current metrics and nested JSON response are dynamically rendered into the page.

## Run

No build tools or dependencies are required. Open `index.html` in a modern browser or deploy the `weather-dashboard` folder with GitHub Pages or another static hosting service.

## Technologies

HTML5 • CSS3 • JavaScript ES2022+ • Fetch API • async/await • REST/JSON

## Data source

Open-Meteo public weather and geocoding APIs.
