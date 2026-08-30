fetch(`https://api.aerisapi.com/observations/closest?p=-37.7933245,144.8728921&client_id=${process.env.XWEATHER_CLIENT_ID}&client_secret=${process.env.XWEATHER_CLIENT_SECRET}&format=json`)
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d.response[0].place, null, 2)))
  .catch(console.error);
