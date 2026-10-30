const https = require('https');
const fs = require('fs');

const API_KEY = process.env.GEMINI_KEY;
if (!API_KEY) process.exit(1);

const bodyData = JSON.stringify({
  contents: [{ parts: [{ text: "Genera únicamente un objeto JSON válido con pronósticos de fútbol para hoy con esta estructura exacta y sin texto adicional: {\"free\":[{\"partido\":\"Real Madrid vs Barcelona\",\"liga\":\"LaLiga\",\"fecha\":\"Hoy 21:00\",\"analisis\":\"Análisis rápido\",\"corners\":\"Más de 9.5\",\"tarjetas\":\"Más de 4.5\",\"remates\":\"Más de 5.5\",\"paradas\":\"Más de 3.5\",\"pick\":\"Gana Madrid\",\"cuota\":\"1.80\",\"resultado\":\"2-1\",\"stake\":\"3/5\"}],\"vip\":[{\"partido\":\"City vs Arsenal\",\"liga\":\"Premier\",\"fecha\":\"Hoy 18:30\",\"analisis\":\"Análisis VIP\",\"corners\":\"Más de 10.5\",\"tarjetas\":\"Más de 5.5\",\"remates\":\"Más de 6.5\",\"paradas\":\"Más de 2.5\",\"pick\":\"Empate\",\"cuota\":\"3.20\",\"resultado\":\"2-2\",\"stake\":\"4/5\"}]}" }] }]
});

const req = https.request({
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyData) }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      let text = json.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
      text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      fs.writeFileSync('data.json', text);
      console.log("¡Listo!");
    } catch(e) { process.exit(1); }
  });
});

req.on('error', () => process.exit(1));
req.write(bodyData);
req.end();
