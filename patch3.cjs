const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

code = code.replace(
  '<div className="text-sm font-bold text-white mb-1">\n            {format(trip.startTime, \'MMM d, yyyy\')}\n          </div>',
  '<div className="text-sm font-bold text-white mb-1 flex items-center gap-2">\n            {format(trip.startTime, \'MMM d, yyyy\')}\n            {trip.weather?.start?.locationName && (\n              <span className="text-[10px] font-normal text-slate-300 flex items-center gap-1">\n                <MapPin className="h-3 w-3" />\n                {trip.weather.start.locationName}\n                {trip.weather.end?.locationName && ` → ${trip.weather.end.locationName}`}\n              </span>\n            )}\n          </div>'
);

fs.writeFileSync('src/components/HistoryTab.tsx', code);
