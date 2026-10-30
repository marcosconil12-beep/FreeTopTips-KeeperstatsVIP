const https = require('https');
const fs = require('fs');

const API_KEY = process.env.GEMINI_KEY;
if (!API_KEY) process.exit(1);

const data = JSON.stringify({
  contents: [{ parts: [{ text: "Genera un JSON estricto con pronósticos deportivos para hoy con esta estructura exacta: {\"free\":[{\"partido\":\"A vs B\",\"liga\":\"Liga\",\"fecha\":\"Hoy\",\"analisis\":\"Ok\",\"corners\":\"+9.5\",\"tarjetas\":\"+4.5\",\"remates\":\"+5.5\",\"paradas\":\"+3.5\",\"pick\":\"Gana A\",\"cuota\":\"1.80\",\"resultado\":\"2-1\",\"stake\":\"3/5\"}],\"vip\":[{\"partido\":\"C vs D\",\"liga\":\"Liga\",\"fecha\":\"Hoy\",\"analisis\":\"Ok\",\"corners\":\"+10.5\",\"tarjetas\":\"+5.5\",\"remates\":\"+6.5\",\"paradas\":\"+2.5\",\"pick\":\"Gana C\",\"cuota\":\"2.00\",\"resultado\":\"1-0\",\"stake\":\"4/5\"}]}. Responde solo con el JSON puro sin markdown." }]
});

const req = https.request({
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, (res) => {
  let body = '';
  res.on('data', (c) => body += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      let text = json.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
      fs.writeFileSync('data.json', text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
      console.log("¡Éxito!");
    } catch(e) { process.exit(1); }
  });
});
req.write(data);
req.end();
