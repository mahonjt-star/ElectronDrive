import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Weather Proxy API
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const clientId = process.env.XWEATHER_CLIENT_ID;
      const clientSecret = process.env.XWEATHER_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "Missing XWeather API credentials" });
      }

      if (!lat || !lon) {
        return res.status(400).json({ error: "Missing lat/lon" });
      }

      const url = `https://api.aerisapi.com/observations/closest?p=${lat},${lon}&client_id=${clientId}&client_secret=${clientSecret}&format=json`;
      const response = await fetch(url);
      const data = await response.json();

      let locationName = "";
      try {
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
          headers: { 'User-Agent': 'EV-Trip-Logger-App/1.0 (mahonjt@gmail.com)' }
        });
        const nomData = await nomRes.json();
        if (nomData && nomData.address) {
          const { suburb, city, town, village, road } = nomData.address;
          locationName = suburb || town || village || city || road || nomData.name || "";
        }
      } catch (err) {
        console.warn("Reverse geocode failed:", err);
      }

      if (data.success && data.response && data.response.length > 0) {
        const obs = data.response[0].ob;
        const loc = data.response[0].loc;
        return res.json({
          temp: obs.tempC,
          condition: obs.weatherShort || obs.weather,
          precip: obs.precipMM || 0,
          lat: loc?.lat,
          lon: loc?.long,
          locationName
        });
      } else {
        return res.status(400).json({ error: "No weather data found", details: data });
      }
    } catch (error) {
      console.error("Weather proxy error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
