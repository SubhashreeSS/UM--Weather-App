const apiKey = apiKeys.key;
const baseUrl = apiKeys.base;

const loader = document.getElementById("loader");
const weatherInfo = document.getElementById("weather-info");
const forecastBox = document.getElementById("forecast");
const weatherIcon = document.getElementById("weather-icon");

const cityName = document.getElementById("city-name");
const country = document.getElementById("country");
const description = document.getElementById("description");
const temp = document.getElementById("temp");
const dateElem = document.getElementById("date");
const timeElem = document.getElementById("time");
const forecastList = document.getElementById("forecast-list");

let currentTimezoneOffset = 0; // will update based on API data

function updateLocalTime() {
  const nowUTC = new Date(
    new Date().getTime() + new Date().getTimezoneOffset() * 60000
  );
  const local = new Date(nowUTC.getTime() + currentTimezoneOffset * 1000);

  dateElem.textContent = local.toDateString();
  // display 12-hour format with AM/PM
  const timeStr = local.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  timeElem.textContent = timeStr.replace(/\b(a\.?m\.?|p\.?m\.?)\b/i, (match) =>
    match.toUpperCase().replace(/\./g, "")
  );
}

// live time update
setInterval(updateLocalTime, 1000);

function getWeather(lat, lon) {
  loader.classList.remove("hidden");
  fetch(`${baseUrl}weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then((res) => res.json())
    .then((data) => showWeather(data))
    .catch(() => alert("Error fetching weather data"));
}

function showWeather(data) {
  loader.classList.add("hidden");
  weatherInfo.classList.remove("hidden");
  forecastBox.classList.remove("hidden");

  cityName.textContent = data.name;
  country.textContent = data.sys.country;
  description.textContent = data.weather[0].main;
  temp.textContent = `${Math.round(data.main.temp)}°C`;

  // Update timezone offset
  currentTimezoneOffset = data.timezone;

  // Weather icons
  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // Forecast details
  forecastList.innerHTML = `
    <li><strong>Feels like:</strong> ${Math.round(data.main.feels_like)}°C</li>
    <li><strong>Humidity:</strong> ${data.main.humidity}%</li>
    <li><strong>Wind Speed:</strong> ${data.wind.speed} km/h</li>
    <li><strong>Pressure:</strong> ${data.main.pressure} hPa</li>
  `;

  updateLocalTime(); // show immediately after fetch
}

function searchCity(city) {
  loader.classList.remove("hidden");
  fetch(`${baseUrl}weather?q=${city}&units=metric&appid=${apiKey}`)
    .then((res) => res.json())
    .then((data) => showWeather(data))
    .catch(() => {
      loader.classList.add("hidden");
      alert("City not found");
    });
}

// Handle location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => getWeather(pos.coords.latitude, pos.coords.longitude),
    () => {
      alert("Location permission denied. Showing default location.");
      getWeather(20.2961, 85.8245); // Odisha default
    }
  );
} else {
  alert("Geolocation not supported");
  getWeather(20.2961, 85.8245);
}

// Search button
document.getElementById("search-btn").addEventListener("click", () => {
  const query = document.getElementById("search").value.trim();
  if (query) searchCity(query);
});
