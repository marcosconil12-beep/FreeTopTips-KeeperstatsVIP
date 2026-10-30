const https = require('https');
const fs = require('fs');

const API_KEY = process.env.GEMINI_KEY;

if (!API_KEY) {
  console.error("No se encontró la API Key.");
  process.exit(1);
}

const prompt = `Actúa como un motor analítico deportivo inteligente autónomo tipo Scores24.
Genera un objeto JSON estricto con pronósticos deportivos reales para hoy dividido exactamente en dos categorías: "free" (3 partidos) y "vip" (3 partidos).

Usa esta estructura JSON exacta:
{
  "free": [
    {
      "partido": "Real Madrid vs Barcelona",
      "liga": "LaLiga España",
      "fecha": "Hoy 21:00",
      "analisis": "Análisis detallado del estado de forma de ambos equipos.",
      "corners": "Más de 9.5",
      "tarjetas": "Más de 4.5",
      "remates": "Más de 5.5",
      "paradas": "Más de 3.5",
      "pick": "Gana Real Madrid",
      "cuota": "1.85",
      "resultado": "2-1",
      "stake": "4/5"
    }
  ],
  "vip": [
    {
      "partido": "Manchester City vs Arsenal",
      "liga": "Premier League",
      "fecha": "Hoy 18:30",
      "analisis": "Análisis táctico profundo para miembros VIP.",
      "corners": "Más de 10.5",
      "tarjetas": "Más de 5.5",
      "remates": "Más de 6.5",
      "paradas": "Más de 2.5",
      "pick": "Empate y ambos marcan",
      "cuota": "3.20",
      "resultado": "2-2",
      "stake": "3/5"
    }
  ]
}
Responde ÚNICAMENTE con el texto JSON puro, sin bloques de código ni texto adicional.`;

const data = JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => { responseBody += chunk; });
  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.candidates && jsonResponse.candidates[0].content.parts[0].text) {
        let rawText = jsonResponse.candidates[0].content.parts[0].text.trim();
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const start = rawText.indexOf('{');
        const end = rawText.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          rawText = rawText.substring(start, end + 1);
        }

        JSON.parse(rawText);
        fs.writeFileSync('data.json', rawText);
        console.log("¡Generado con éxito!");
      } else {
        console.error("Respuesta:", responseBody);
        process.exit(1);
      }
    } catch (e) {
      console.error("Error:", e, responseBody);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error("Error HTTPS:", error);
  process.exit(1);
});

req.write(data);
req.end();
