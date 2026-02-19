require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3002; // ✅ choose ONE port only
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'agri-assist-ui-main')));

// Weather by coordinates
app.get('/api/weather/coordinates', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) throw new Error('Weather not found');

    const data = await response.json();
    res.json(formatWeatherData(data));
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Weather by city
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City parameter is required' });

  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) throw new Error('Weather not found');

    const data = await response.json();
    res.json(formatWeatherData(data));
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Price API
app.get('/api/prices', (req, res) => {
  const { location, crop } = req.query;
  res.json({
    crop,
    location,
    minPrice: Math.floor(Math.random() * 1000 + 1000),
    maxPrice: Math.floor(Math.random() * 1500 + 1500),
    time: new Date().toLocaleTimeString()
  });
});

// Serve price page
app.get('/price', (req, res) => {
  res.sendFile(path.join(__dirname, 'agri-assist-ui-main', 'price.html'));
});

// Serve index page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'agri-assist-ui-main', 'index.html'));
});

// Helper function to format weather data
function formatWeatherData(data) {
  return {
    city: data.name,
    country: data.sys.country,
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    description: data.weather[0].description,
    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    timestamp: new Date().toISOString()
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Price page: http://localhost:${PORT}/price`);
});
