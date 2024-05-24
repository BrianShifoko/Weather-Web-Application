document.getElementById('search-btn').addEventListener('click', () => fetchWeather());
document.getElementById('country-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        fetchWeather();
    }
});

const toggleSwitch = document.getElementById('unit-toggle');
let unit = 'metric';

toggleSwitch.addEventListener('change', () => {
    if (toggleSwitch.checked) {
        unit = 'imperial';
    } else {
        unit = 'metric';
    }
    fetchWeather();
});

async function fetchWeather() {
    const country = document.getElementById('country-input').value;
    if (!country) return;

    const apiKey = '4eb3703790b356562054106543b748b2'; 

    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${country}&units=${unit}&appid=${apiKey}`);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
            alert('Please enter a valid city or town name.');
            return;
        }

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${country}&units=${unit}&appid=${apiKey}`);
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData, forecastData, unit);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data.');
    }
}

function displayWeather(weatherData, forecastData, unit) {
    const weatherCard = document.getElementById('weather-card');
    weatherCard.style.display = 'block';

    const tempUnit = unit === 'metric' ? '°C' : '°F';
    const windSpeedUnit = unit === 'metric' ? 'km/h' : 'mph';
    const temp = weatherData.main.temp;
    const weatherDescription = weatherData.weather[0].description;
    const windSpeed = (unit === 'metric') ? (weatherData.wind.speed * 3.6).toFixed(2) : weatherData.wind.speed;
    const icon = weatherData.weather[0].icon;

   
    const nextDayForecast = forecastData.list.find(item => {
        const forecastDate = new Date(item.dt_txt);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return forecastDate.getDate() === tomorrow.getDate();
    });

    const nextDayTemp = nextDayForecast.main.temp;
    const nextDayDescription = nextDayForecast.weather[0].description;
    const nextDayIcon = nextDayForecast.weather[0].icon;

    
    document.body.style.backgroundImage = getBackgroundImage(weatherData.weather[0].main);

    const currentDate = new Date().toLocaleDateString();

    weatherCard.innerHTML = `
        <div class="weather-info">
            <h2>${weatherData.name}</h2>
            <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather icon">
        </div>
        <p>Date: ${currentDate}</p>
        <p>Temperature: ${temp} ${tempUnit}</p>
        <p>Weather: ${weatherDescription}</p>
        <p>Wind Speed: ${windSpeed} ${windSpeedUnit}</p>
        <h3>Next Day Forecast</h3>
        <div class="weather-info">
            <p>Temperature: ${nextDayTemp} ${tempUnit}</p>
            <p>Weather: ${nextDayDescription}</p>
            <img src="http://openweathermap.org/img/wn/${nextDayIcon}.png" alt="Next day weather icon">
        </div>
    `;

    let adviceMessage = '';

    if (nextDayDescription.includes('rain')) {
        adviceMessage = "Don't forget to carry an umbrella tomorrow!";
    } else if (nextDayDescription.includes('sunny')) {
        adviceMessage = "It's going to be sunny tomorrow!";
    } else if (nextDayDescription.includes('thunderstorm')) {
        adviceMessage = "Caution: Thunderstorms expected tomorrow. Stay indoors if possible!";
    } else if (nextDayDescription.includes('snow')) {
        adviceMessage = "Snowfall expected tomorrow. Wear warm clothes and be careful on the roads!";
    } else if (nextDayDescription.includes('cloudy')) {
        adviceMessage = "It's going to be cloudy tomorrow.";
    }

    if (nextDayForecast.wind.speed > 10) {
        adviceMessage += " Strong winds expected. Wear heavier clothes and be cautious if you need to go outside.";
    } else {
        adviceMessage += " Light winds expected.";
    }

    if (nextDayTemp > 30) { 
        adviceMessage += " Expect high temperatures. Stay hydrated and wear light clothing.";
    } else if (nextDayTemp < 10) { 
        adviceMessage += " It's going to be cold. Wear warm clothing.";
    } else {
        if (nextDayDescription.includes('rain') || nextDayDescription.includes('snow')) {
            adviceMessage += " Ensure you are prepared for wet conditions.";
        } else if (nextDayDescription.includes('sunny')) {
            adviceMessage += " Light clothes should be fine.";
        } else if (nextDayDescription.includes('cloudy')) {
            adviceMessage += " Consider wearing layers.";
        } else {
            adviceMessage += " Enjoy the pleasant weather. Dress comfortably and have a great day!";
        }
    }

    weatherCard.innerHTML += `<p>${adviceMessage}</p>`;
}

function getBackgroundImage(weatherMain) {
    switch (weatherMain) {
        case 'Clear':
            return 'url("https://www.pexels.com/photo/waterfalls-during-sunset-954929/")'; 
        case 'Clouds':
            return 'url("https://www.pexels.com/photo/crop-field-under-sunny-sky-3590/")'; 
        case 'Rain':
            return 'url("https://www.pexels.com/photo/silhouette-and-grayscale-photography-of-man-standing-under-the-rain-1530423/")'; 
        case 'Snow':
            return 'url("https://www.pexels.com/photo/snow-covered-forest-field-1571442/")'; 
        case 'Thunderstorm':
            return 'url("https://www.pexels.com/photo/cloudy-sky-846980/")'; 
        default:
            return 'url("https://www.pexels.com/photo/rainbow-on-grass-field-108941/")'; 
    }
}
