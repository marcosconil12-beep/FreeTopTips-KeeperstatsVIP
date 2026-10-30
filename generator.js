const https = require('https');
const fs = require('fs');

const API_KEY = process.env.GEMINI_KEY;

if (!API_KEY) {
  console.error("No se encontró la API Key.");
  process.exit(1);
}

const prompt = `Actúa como un motor analítico deportivo inteligente autónomo tipo Scores24.
Busca y selecciona partidos destacados reales que se jueguen HOY o en las próximas 24 horas en ligas principales (LaLiga, Premier, Champions, Serie A, Libertadores, etc.).
Genera una respuesta JSON estricta dividida en dos categorías: "free" (3 partidos) y "vip" (3 partidos más exclusivos).

Usa estrictamente esta estructura JSON pura:
{
  "free": [
    {
      "partido": "Equipo A vs Equipo B",
      "liga": "LaLiga España",
      "fecha": "Hoy 21:00",
      "analisis": "Resumen completo del estado de forma y bajas...",
      "corners": "Más de 9.5",
      "tarjetas": "Más de 4.5",
      "remates": "Jugador X > 1.5",
      "paradas": "Portero Y > 2.5",
      "pick": "Gana Equipo A",
      "cuota": "1.80",
      "resultado": "2-1",
      "stake": "3/5"
    }
  ],
  "vip": [
    {
      "partido": "Equipo C vs Equipo D",
      "liga": "Premier League",
      "fecha": "Hoy 20:00",
      "analisis": "Análisis profundo VIP táctico y dinámicas de apuestas...",
      "corners": "Más de 10.5",
      "tarjetas": "Más de 5.5",
      "remates": "Jugador Z > 2.5",
      "paradas": "Portero K > 3.5",
      "pick": "Ambos anotan & +2.5 goles",
      "cuota": "2.10",
      "resultado": "3-2",
      "stake": "4/5"
    }
  ]
}
Responde ÚNICAMENTE con el objeto JSON sin bloques de código markdown ni texto adicional.`;

const data = JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }],
  tools: [{ googleSearch: {} }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

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
        console.log("¡Pronósticos automáticos generados con éxito!");
      } else {
        console.error("Estructura de respuesta inesperada:", responseBody);
        process.exit(1);
      }
    } catch (e) {
      console.error("Error al procesar el JSON:", e, responseBody);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error("Error en la petición:", error);
  process.exit(1);
});

req.write(data);
req.end();
