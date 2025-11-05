// Select input field and search button
const cityInput = document.querySelector('.city-input');  
const searchBtn = document.querySelector('.search-btn');  

// Sections in the UI
const weatherInfoSection = document.querySelector('.weather-info');  
const notFoundSection = document.querySelector('.not-found'); 
const searchCitySection = document.querySelector('.search-city'); 

// Weather display elements
const countryTxt = document.querySelector('.country-txt'); 
const tempTxt = document.querySelector('.temp-txt');  
const conditionTxt = document.querySelector('.condition-txt'); 
const humidityValueTxt = document.querySelector('.humidity-value-txt'); // Humidity
const windValueTxt = document.querySelector('.wind-value-txt'); // Wind speed
const weatherSummaryImg = document.querySelector('.weather-summary-img'); // Main weather icon
const currentDateTxt = document.querySelector('.current-data-txt'); // Current date
const forecastItemContainer = document.querySelector('.forecast-items-container'); // Container for forecast cards

 
const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

// Event listeners for search
searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() !== '') {  
    updateWeatherInfo(cityInput.value); // Fetch and display weather
    cityInput.value = '';  
    cityInput.blur(); // Remove focus
  }
});

cityInput.addEventListener('keydown', (event) => {
  if (event.key === "Enter" && cityInput.value.trim() !== '') { // Trigger on Enter key
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

// Function to fetch weather data from API
async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json(); // Return JSON data
}

// Function to get weather icon based on weather ID
function getWeatherIcon(id) {
  if (id <= 232) return 'thunderstorm.svg';
  if (id <= 321) return 'drizzle.svg';
  if (id <= 531) return 'rain.svg';
  if (id <= 622) return 'snow.svg';
  if (id <= 781) return 'atmosphere.svg';
  if (id === 800) return 'clear.svg';
  return 'clouds.svg';
}

// Get current date in a readable format
function getCurrentDate() {
  const currentDate = new Date();
  const options = { weekday: 'short', day: '2-digit', month: 'short' };
  return currentDate.toLocaleDateString('en-GB', options);
}

// Main function to update weather info
async function updateWeatherInfo(city) {
  const weatherData = await getFetchData('weather', city);

  if (weatherData.cod != 200) { // If city not found
    showDisplaySection(notFoundSection);
    return;
  }

  // Destructure relevant data from API response
  const { name: country, main: { temp, humidity }, weather: [{ id, main }], wind: { speed } } = weatherData;

  // Update UI elements with data
  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + '°C';
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = humidity + '%';
  windValueTxt.textContent = speed + 'M/s';
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;
  currentDateTxt.textContent = getCurrentDate();

  await updateForecastsInfo(city); // Update forecast section

  showDisplaySection(weatherInfoSection); // Show weather section
}

// Function to fetch and display forecast
async function updateForecastsInfo(city) {
  const forecastsData = await getFetchData('forecast', city);
  const timeTaken = '12:00:00'; // Pick forecast data for 12 PM
  const todayDate = new Date().toISOString().split('T')[0]; // Today's date

  forecastItemContainer.innerHTML = ''; // Clear previous forecast

  // Loop through forecast list and display items
  forecastsData.list.forEach(forecastWeather => {
    if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
      updateForecastsItems(forecastWeather);
    }
  });
}

// Function to create a forecast item card
function updateForecastsItems(weatherData) {
  const { dt_txt: date, weather: [{ id }], main: { temp } } = weatherData;
  const dateTaken = new Date(date);
  const dateOption = { day: '2-digit', month: 'short' };
  const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

  // HTML structure for forecast item
  const forecastItem = `
    <div class="forecast-item">
      <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
      <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img" />
      <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
    </div>
  `;
  forecastItemContainer.insertAdjacentHTML('beforeend', forecastItem);
}

// Function to show only one section and hide others
function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection].forEach(s => s.style.display = 'none');
  section.style.display = 'flex';
}
