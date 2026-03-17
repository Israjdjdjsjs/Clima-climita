const locateBtn = document.getElementById('locateBtn');
const weatherSection = document.getElementById('weather');
const statusText = document.getElementById('status');
const placeName = document.getElementById('placeName');

const tempEl = document.getElementById('temp');
const feelsLikeEl = document.getElementById('feelsLike');
const windEl = document.getElementById('wind');
const stateEl = document.getElementById('state');
const updatedAtEl = document.getElementById('updatedAt');

let refreshTimer;

const weatherCodes = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla helada',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos intensos',
  95: 'Tormenta eléctrica'
};

async function getPlaceName(lat, lon) {
  const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`;
  const response = await fetch(url);
  if (!response.ok) return `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
  const data = await response.json();
  return data.address?.city || data.address?.town || data.address?.village || data.display_name || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
}

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('No se pudo obtener el clima.');
  const data = await response.json();
  return data.current;
}

function renderWeather(current) {
  tempEl.textContent = current.temperature_2m.toFixed(1);
  feelsLikeEl.textContent = current.apparent_temperature.toFixed(1);
  windEl.textContent = current.wind_speed_10m.toFixed(1);
  stateEl.textContent = weatherCodes[current.weather_code] || `Código ${current.weather_code}`;
  updatedAtEl.textContent = new Date().toLocaleTimeString('es-ES');
  weatherSection.classList.remove('hidden');
}

async function updateByCoords(lat, lon) {
  statusText.textContent = 'Actualizando clima...';
  const [name, weather] = await Promise.all([getPlaceName(lat, lon), getWeather(lat, lon)]);
  placeName.textContent = name;
  renderWeather(weather);
  statusText.textContent = 'Clima actualizado correctamente.';
}

function startRealtimeUpdates(lat, lon) {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    updateByCoords(lat, lon).catch((error) => {
      statusText.textContent = error.message;
    });
  }, 60000);
}

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    statusText.textContent = 'Tu navegador no soporta geolocalización.';
    return;
  }

  statusText.textContent = 'Solicitando ubicación...';

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        await updateByCoords(coords.latitude, coords.longitude);
        startRealtimeUpdates(coords.latitude, coords.longitude);
      } catch (error) {
        statusText.textContent = error.message;
      }
    },
    () => {
      statusText.textContent = 'No se pudo obtener tu ubicación.';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});
