document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const countryInput = document.getElementById('country-input');
    const toggleSwitch = document.getElementById('unit-toggle');
    const weatherCard = document.getElementById('weather-card');

    let unit = 'metric';

    searchBtn.addEventListener('click', fetchWeather);
    countryInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchWeather();
        }
    });
    toggleSwitch.addEventListener('change', () => {
        unit = toggleSwitch.checked ? 'imperial' : 'metric';
        fetchWeather();
    });

    async function fetchWeather() {
        const country = countryInput.value.trim();
        if (!country) return;

        const apiKey = '4eb3703790b356562054106543b748b2'; 

        try {
            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(`https://api.openweathermap.org/data/2.5/weather?q=${country}&units=${unit}&appid=${apiKey}`),
                fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${country}&units=${unit}&appid=${apiKey}`)
            ]);

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            if (weatherData.cod !== 200) {
                alert('Please enter a valid city or town name.');
                return;
            }

            displayWeather(weatherData, forecastData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data.');
        }
    }

    function displayWeather(weatherData, forecastData) {
        weatherCard.style.display = 'block';

        const tempUnit = unit === 'metric' ? '°C' : '°F';
        const windSpeedUnit = unit === 'metric' ? 'km/h' : 'mph';
        const temp = weatherData.main.temp;
        const weatherDescription = weatherData.weather[0].description;
        const windSpeed = (unit === 'metric') ? (weatherData.wind.speed * 3.6).toFixed(2) : weatherData.wind.speed;
        const icon = weatherData.weather[0].icon;

        const nextDayForecast = getNextDayForecast(forecastData);
        const nextDayTemp = nextDayForecast.main.temp;
        const nextDayDescription = nextDayForecast.weather[0].description;
        const nextDayIcon = nextDayForecast.weather[0].icon;

        document.body.style.backgroundImage = getBackgroundImage(weatherData.weather[0].main);

        weatherCard.innerHTML = `
            ${createWeatherInfoSection(weatherData.name, icon, temp, tempUnit, weatherDescription, windSpeed, windSpeedUnit)}
            <h3>Next Day Forecast</h3>
            ${createWeatherInfoSection(null, nextDayIcon, nextDayTemp, tempUnit, nextDayDescription, nextDayForecast.wind.speed, windSpeedUnit)}
            <p>${generateAdviceMessage(nextDayDescription, nextDayTemp, nextDayForecast.wind.speed)}</p>
        `;
    }

    function getNextDayForecast(forecastData) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return forecastData.list.find(item => new Date(item.dt_txt).getDate() === tomorrow.getDate());
    }

    function createWeatherInfoSection(city, icon, temp, tempUnit, description, windSpeed, windSpeedUnit) {
        return `
            <div class="weather-info">
                ${city ? `<h2>${city}</h2>` : ''}
                <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather icon">
            </div>
            <p>Temperature: ${temp} ${tempUnit}</p>
            <p>Weather: ${description}</p>
            <p>Wind Speed: ${windSpeed} ${windSpeedUnit}</p>
        `;
    }

    function generateAdviceMessage(description, temp, windSpeed) {
        let adviceMessage = '';

        if (description.includes('rain')) {
            adviceMessage = "Don't forget to carry an umbrella tomorrow!";
        } else if (description.includes('sunny')) {
            adviceMessage = "It's going to be sunny tomorrow!";
        } else if (description.includes('thunderstorm')) {
            adviceMessage = "Caution: Thunderstorms expected tomorrow. Stay indoors if possible!";
        } else if (description.includes('snow')) {
            adviceMessage = "Snowfall expected tomorrow. Wear warm clothes and be careful on the roads!";
        } else if (description.includes('cloudy')) {
            adviceMessage = "It's going to be cloudy tomorrow.";
        }

        if (windSpeed > 10) {
            adviceMessage += " Strong winds expected. Wear heavier clothes and be cautious if you need to go outside.";
        } else {
            adviceMessage += " Light winds expected.";
        }

        if (temp > 30) {
            adviceMessage += " Expect high temperatures. Stay hydrated and wear light clothing.";
        } else if (temp < 10) {
            adviceMessage += " It's going to be cold. Wear warm clothing.";
        } else {
            adviceMessage += " Enjoy the pleasant weather. Dress comfortably and have a great day!";
        }

        return adviceMessage;
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
});
