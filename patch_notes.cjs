const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// 1. Remove the note under seasonStats
const seasonNoteStr = `          </div>
          <div className="text-[10px] text-white/70 italic px-1">
            Note: Peri-Urban and Medium Speed trips are most efficient as the vehicle neither pays a penalty for (1) the fixed cost of software and other ancillary functions, or (2) decreased aerodynamic efficiency.
          </div>
        </div>
      )}

      {categoryStats.length > 0 && (`

const seasonNoteReplace = `          </div>
        </div>
      )}

      {categoryStats.length > 0 && (`

code = code.replace(seasonNoteStr, seasonNoteReplace);

// 2. Modify the note under categoryStats
const catNoteStr = `          </div>
          <div className="text-[10px] text-white/70 italic px-1 mt-2">
            Note: Peri-Urban and Medium Speed trips are most efficient as the vehicle neither pays a penalty for (1) the fixed cost of software and other ancillary functions, or (2) decreased aerodynamic efficiency.
          </div>
        </div>
      )}

      {speedStats.length > 0 && (`

const catNoteReplace = `          </div>
          <div className="text-[10px] text-white/70 italic px-1 mt-2">
            Note: Peri-Urban trips are most efficient as the vehicle avoids a high penalty for the fixed cost of software (and other ancillary functions) and significantly decreased aerodynamic efficiency.
          </div>
        </div>
      )}

      {speedStats.length > 0 && (`

code = code.replace(catNoteStr, catNoteReplace);

// 3. Add note under speedStats
const speedNoteStr = `            ))}
          </div>
        </div>
      )}

      {payloadStats.length > 0 && (`

const speedNoteReplace = `            ))}
          </div>
          <div className="text-[10px] text-white/70 italic px-1 mt-2">
            Note: Medium Speed trips are most efficient as the vehicle avoids a high penalty for the fixed cost of software (and other ancillary functions) and significantly decreased aerodynamic efficiency.
          </div>
        </div>
      )}

      {payloadStats.length > 0 && (`

code = code.replace(speedNoteStr, speedNoteReplace);

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
