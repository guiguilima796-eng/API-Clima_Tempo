require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Rota para buscar o clima
app.get('/api/weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    console.log("Cidade não fornecida.");
    return res.status(400).json({ error: "Cidade é obrigatória." });
  }

  console.log(`🔍 Buscando clima para: ${city}`);

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: `${city},BR`,
          appid: process.env.API_KEY,
          units: 'metric',
          lang: 'pt_br'
        }
      }
    );

    const data = response.data;
    console.log(`✅ Clima encontrado: ${data.weather[0].description}, ${data.main.temp}°C`);
    res.json(data);
  } catch (error) {
    console.error("❌ Erro ao buscar clima:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao buscar clima" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
