const clientId = process.env.XWEATHER_CLIENT_ID || "x";
const clientSecret = process.env.XWEATHER_CLIENT_SECRET || "y";
const url = `https://data.xweather.com/observations/closest?p=-33.86,151.2&client_id=${clientId}&client_secret=${clientSecret}&format=json`;
console.log("URL:", url);
fetch(url).then(r => r.json()).then(console.log).catch(console.error);
