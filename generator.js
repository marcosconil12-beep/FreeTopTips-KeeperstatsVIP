const fs = require('fs');

const API_KEY = process.env.GEMINI_KEY;

if (!API_KEY) {
  console.error("No se encontró la API Key en el entorno.");
  process.exit(1);
}

async function run() {
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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      let rawText = data.candidates[0].content.parts[0].text.trim();
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        rawText = rawText.substring(start, end + 1);
      }

      // Validar JSON y guardarlo en data.json
      JSON.parse(rawText);
      fs.writeFileSync('data.json', rawText);
      console.log("¡Pronósticos automáticos actualizados correctamente en data.json!");
    } else {
      console.error("Error en la respuesta de la IA:", JSON.stringify(data));
      process.exit(1);
    }
  } catch (err) {
    console.error("Error de ejecución:", err);
    process.exit(1);
  }
}

run();
