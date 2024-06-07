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

            if (!weatherResponse.ok) {
                throw new Error(`Weather API error: ${weatherResponse.statusText}`);
            }
            if (!forecastResponse.ok) {
                throw new Error(`Forecast API error: ${forecastResponse.statusText}`);
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            if (weatherData.cod !== 200) {
                alert('Please enter a valid city or town name.');
                return;
            }

            displayWeather(weatherData, forecastData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert(`Failed to fetch weather data. Error: ${error.message}`);
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
        const humidity = weatherData.main.humidity;
        const pressure = weatherData.main.pressure;
        const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const nextDayForecast = getNextDayForecast(forecastData);

        const nextDaySunTimes = getSunTimes(weatherData.coord.lat, weatherData.coord.lon, new Date().getTime() + 86400000);
        const nextDaySunrise = nextDaySunTimes.sunrise;
        const nextDaySunset = nextDaySunTimes.sunset;

        document.body.style.backgroundImage = getBackgroundImage(weatherData.weather[0].main);

        weatherCard.innerHTML = `
            ${createWeatherInfoSection(weatherData.name, icon, temp, tempUnit, weatherDescription, windSpeed, windSpeedUnit, humidity, pressure, sunrise, sunset)}
            <h3>Next Day Forecast</h3>
            ${createWeatherInfoSection(null, nextDayForecast.weather[0].icon, nextDayForecast.main.temp, tempUnit, nextDayForecast.weather[0].description, nextDayForecast.wind.speed, windSpeedUnit, nextDayForecast.main.humidity, nextDayForecast.main.pressure, nextDaySunrise, nextDaySunset)}
            <p>${generateAdviceMessage(nextDayForecast.weather[0].description, nextDayForecast.main.temp, nextDayForecast.wind.speed)}</p>
        `;
    }

    function createWeatherInfoSection(city, icon, temp, tempUnit, description, windSpeed, windSpeedUnit, humidity, pressure, sunrise, sunset) {
        return `
            <div class="weather-info">
                ${city ? `<h2>${city}</h2>` : ''}
                <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather icon">
            </div>
            <p>Temperature: ${temp} ${tempUnit}</p>
            <p>Weather: ${description}</p>
            <p>Wind Speed: ${windSpeed} ${windSpeedUnit}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Pressure: ${pressure} hPa</p>
            <p>Sunrise: ${sunrise}</p>
            <p>Sunset: ${sunset}</p>
        `;
    }

    function getNextDayForecast(forecastData) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return forecastData.list.find(item => new Date(item.dt_txt).getDate() === tomorrow.getDate());
    }

    function getSunTimes(lat, lon, timestamp) {
        const times = SunCalc.getTimes(new Date(timestamp), lat, lon);
        const sunrise = times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunset = times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { sunrise, sunset };
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

        if (unit === 'metric') {
            if (temp > 30) {
                adviceMessage += " Expect high temperatures. Stay hydrated and wear light clothing.";
            } else if (temp < 10) {
                adviceMessage += " It's going to be cold. Wear warm clothing.";
            } else {
                adviceMessage += " Enjoy the pleasant weather. Dress comfortably and have a great day!";
            }
        } else if (unit === 'imperial') {
            const tempCelsius = (temp - 32) * 5 / 9; 
            if (tempCelsius > 30) {
                adviceMessage += " Expect high temperatures. Stay hydrated and wear light clothing.";
            } else if (tempCelsius < 10) {
                adviceMessage += " It's going to be cold. Wear warm clothing.";
            } else {
                adviceMessage += " Enjoy the pleasant weather. Dress comfortably and have a great day!";
            }
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
                return 'url("https://www.pexels.com/photo/person-walking-on-snow-field-2373837/")';
            case 'Thunderstorm':
                return 'url("https://www.pexels.com/photo/snow-storm-ways-2531708/")';
            default:
                return 'url("https://www.pexels.com/photo/clear-glass-frame-on-the-beach-88212/")';
        }
    }
});
