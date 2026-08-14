const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

const elements = {
  form: document.querySelector("#searchForm"),
  input: document.querySelector("#cityInput"),
  button: document.querySelector("#searchButton"),
  status: document.querySelector("#statusPill"),
  error: document.querySelector("#errorBox"),
  loading: document.querySelector("#loadingBox"),
  section: document.querySelector("#weatherSection"),
  locationName: document.querySelector("#locationName"),
  locationMeta: document.querySelector("#locationMeta"),
  symbol: document.querySelector("#weatherSymbol"),
  temperature: document.querySelector("#temperature"),
  temperatureUnit: document.querySelector("#temperatureUnit"),
  humidity: document.querySelector("#humidity"),
  windSpeed: document.querySelector("#windSpeed"),
  windUnit: document.querySelector("#windUnit"),
  updatedTime: document.querySelector("#updatedTime"),
  dayState: document.querySelector("#dayState"),
  jsonViewer: document.querySelector("#jsonViewer"),
  forecastEndpoint: document.querySelector("#forecastEndpoint"),
  coordinates: document.querySelector("#coordinates"),
  timezone: document.querySelector("#timezone")
};

const WEATHER_CODES = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Moderate drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Moderate rain showers", "🌧️"],
  82: ["Violent rain showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"]
};

function setLoading(isLoading) {
  elements.loading.hidden = !isLoading;
  elements.button.disabled = isLoading;
  elements.input.disabled = isLoading;
  elements.status.textContent = isLoading ? "Fetching…" : "Live";
}

function showError(message) {
  elements.error.textContent = message;
  elements.error.hidden = false;
  elements.status.textContent = "Error";
}

function clearError() {
  elements.error.hidden = true;
  elements.error.textContent = "";
}

async function fetchJson(url, label) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`${label} request failed with HTTP ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`${label} returned invalid JSON data.`);
  }
}

async function findCity(cityName) {
  const url = new URL(GEOCODING_API);
  url.searchParams.set("name", cityName);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const data = await fetchJson(url, "City search");

  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(`No location was found for “${cityName}”. Try a different city name.`);
  }

  return data.results[0];
}

async function fetchWeather(location) {
  const url = new URL(WEATHER_API);
  url.searchParams.set("latitude", location.latitude);
  url.searchParams.set("longitude", location.longitude);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const data = await fetchJson(url, "Weather");

  if (!data.current || typeof data.current !== "object") {
    throw new Error("The weather response did not contain current conditions.");
  }

  return { data, url: url.toString() };
}

function formatValue(value) {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return String(value);
}

function createJsonNode(value, key = null) {
  const wrapper = document.createElement("div");
  wrapper.className = "json-node";

  if (key !== null) {
    const keySpan = document.createElement("span");
    keySpan.className = "json-key";
    keySpan.textContent = `${key}: `;
    wrapper.appendChild(keySpan);
  }

  if (value !== null && typeof value === "object") {
    const open = document.createElement("span");
    open.textContent = Array.isArray(value) ? "[" : "{";
    wrapper.appendChild(open);

    Object.entries(value).forEach(([childKey, childValue]) => {
      wrapper.appendChild(createJsonNode(childValue, childKey));
    });

    const close = document.createElement("span");
    close.textContent = Array.isArray(value) ? "]" : "}";
    wrapper.appendChild(close);
    return wrapper;
  }

  const valueSpan = document.createElement("span");
  const type = value === null ? "null" : typeof value;
  valueSpan.className = `json-${type === "string" ? "string" : type}`;
  valueSpan.textContent = formatValue(value);
  wrapper.appendChild(valueSpan);
  return wrapper;
}

function renderJson(data) {
  elements.jsonViewer.replaceChildren();
  elements.jsonViewer.appendChild(createJsonNode(data));
}

function getWeatherDescription(code) {
  return WEATHER_CODES[code] || ["Unknown condition", "🌡️"];
}

function renderWeather(location, weather, endpoint) {
  const { data } = weather;
  const current = data.current;
  const units = data.current_units || {};
  const [description, icon] = getWeatherDescription(current.weather_code);

  elements.locationName.textContent = `${location.name}, ${location.country}`;
  elements.locationMeta.textContent = `${location.admin1 || location.country} • ${description}`;
  elements.symbol.textContent = icon;
  elements.symbol.setAttribute("aria-label", description);

  elements.temperature.textContent = Number(current.temperature_2m).toFixed(1);
  elements.temperatureUnit.textContent = units.temperature_2m || "°C";
  elements.humidity.textContent = Math.round(current.relative_humidity_2m);
  elements.windSpeed.textContent = Number(current.wind_speed_10m).toFixed(1);
  elements.windUnit.textContent = units.wind_speed_10m || "km/h";
  elements.updatedTime.textContent = current.time?.split("T")[1] || current.time || "—";
  elements.dayState.textContent = Number(current.is_day) === 1 ? "Daytime" : "Nighttime";

  elements.forecastEndpoint.textContent = endpoint;
  elements.coordinates.textContent = `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}`;
  elements.timezone.textContent = data.timezone || location.timezone || "Auto";

  renderJson({
    location: {
      name: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    },
    current: data.current,
    current_units: data.current_units,
    timezone: data.timezone
  });

  elements.section.hidden = false;
}

async function loadWeather(cityName) {
  const trimmedCity = cityName.trim();
  if (!trimmedCity) return;

  clearError();
  setLoading(true);
  elements.section.hidden = true;

  try {
    const location = await findCity(trimmedCity);
    const weather = await fetchWeather(location);
    renderWeather(location, weather, weather.url);
    elements.status.textContent = "Live";
  } catch (error) {
    console.error(error);
    showError(error instanceof Error ? error.message : "Something went wrong while loading weather data.");
  } finally {
    setLoading(false);
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadWeather(elements.input.value);
});

document.querySelectorAll(".quick-city").forEach((button) => {
  button.addEventListener("click", () => {
    const city = button.dataset.city;
    elements.input.value = city;
    loadWeather(city);
  });
});

loadWeather("Bengaluru");
