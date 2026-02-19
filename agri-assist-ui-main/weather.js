// agri-assist-ui-main/weather.js
function showWeatherLoading() {
    const weatherDiv = document.getElementById('weather-container');
    if (!weatherDiv) return;
    weatherDiv.innerHTML = '<div class="loading">Detecting your location...</div>';
}

function getWeatherByCoords(lat, lon) {
    showWeatherLoading();
    
    fetch(`/api/weather/coordinates?lat=${lat}&lon=${lon}`)
        .then(response => {
            if (!response.ok) throw new Error('Weather not available');
            return response.json();
        })
        .then(updateWeatherDisplay)
        .catch(error => {
            console.error('Error:', error);
            // Fallback to default city if geolocation fails
            getWeather('Tirupati');
        });
}

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                getWeather('Tirupati'); // Fallback to default city
            }
        );
    } else {
        getWeather('Tirupati'); // Fallback if geolocation is not supported
    }
}

// Auto-refresh weather every 30 minutes
getCurrentLocationWeather();
setInterval(getCurrentLocationWeather, 30 * 60 * 1000);