// Configuração inicial do mapa Leaflet
const map = L.map('map').setView([-14.235, -51.9253], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

let marker = null;

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const resultDiv = document.getElementById('result');
const toggleThemeBtn = document.getElementById('toggleTheme');
const historyList = document.getElementById('historyList');
const historySection = document.getElementById('historySection');

const STORAGE_KEY = 'weatherAppHistory';

// Função para carregar histórico do localStorage
function loadHistory() {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  historyList.innerHTML = '';

  history.forEach((city) => {
    const li = document.createElement('li');
    li.textContent = city;
    li.title = `Buscar clima de ${city}`;
    li.addEventListener('click', () => {
      cityInput.value = city;
      getWeather(city);
    });
    historyList.appendChild(li);
  });

  historySection.style.display = history.length ? 'block' : 'none';
}

// Função para salvar cidade no histórico
function saveHistory(city) {
  if (!city) return;
  let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Evita duplicados
  history = history.filter((c) => c.toLowerCase() !== city.toLowerCase());
  history.unshift(city);

  // Mantém só os últimos 10
  if (history.length > 10) history.pop();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  loadHistory();
}

// Alternar tema claro/escuro
function toggleTheme() {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark')
    ? '☀️'
    : '🌙';
}

// Buscar clima por nome da cidade
async function getWeather(cityName) {
  const city = cityName || cityInput.value.trim();
  if (!city) {
    alert('Por favor, digite uma cidade.');
    return;
  }

  resultDiv.innerHTML = '🔍 Buscando dados...';
  resultDiv.style.opacity = '1';

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Cidade não encontrada');

    const data = await response.json();

    // Mostrar dados com ícones reais do OpenWeather
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    resultDiv.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <div class="weather-main" style="display:flex; align-items:center; gap: 12px;">
        <img src="${iconUrl}" alt="${data.weather[0].description}" width="60" height="60" />
        <p style="font-size:1.4rem; margin: 0;">${data.main.temp}°C</p>
      </div>
      <p><strong>Clima:</strong> ${data.weather[0].description}</p>
      <p><strong>Umidade:</strong> ${data.main.humidity}%</p>
      <p><strong>Vento:</strong> ${data.wind.speed} m/s</p>
    `;

    // Atualizar mapa
    const lat = data.coord.lat;
    const lon = data.coord.lon;

    map.setView([lat, lon], 10);

    if (marker) {
      map.removeLayer(marker);
    }

    marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(
        `<b>${data.name}</b><br>${data.weather[0].description}, ${data.main.temp}°C`
      )
      .openPopup();

    saveHistory(data.name);
  } catch (error) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Erro: ${error.message}</p>`;
  }
}

// Event listeners
searchBtn.addEventListener('click', () => getWeather());
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') getWeather();
});

toggleThemeBtn.addEventListener('click', toggleTheme);

// Carregar histórico ao abrir página
loadHistory();

// Carregar tema salvo
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  toggleThemeBtn.textContent = '☀️';
} else {
  toggleThemeBtn.textContent = '🌙';
}

// Salvar tema ao alternar
toggleThemeBtn.addEventListener('click', () => {
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});
