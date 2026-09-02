const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

const seasonEndStr = `              </div>
            ))}
          </div>
        </div>
      )}

      {categoryStats.length > 0 && (`;

const seasonEndReplace = `              </div>
            ))}
          </div>
          <div className="text-[10px] text-white/70 italic px-1">
            Note: Peri-Urban and Medium Speed trips are most efficient as the vehicle neither pays a penalty for (1) the fixed cost of software and other ancillary functions, or (2) decreased aerodynamic efficiency.
          </div>
        </div>
      )}

      {categoryStats.length > 0 && (`;

const catEndStr = `              </div>
            ))}
          </div>
        </div>
      )}

      {speedStats.length > 0 && (`;

const catEndReplace = `              </div>
            ))}
          </div>
          <div className="text-[10px] text-white/70 italic px-1">
            Note: Peri-Urban and Medium Speed trips are most efficient as the vehicle neither pays a penalty for (1) the fixed cost of software and other ancillary functions, or (2) decreased aerodynamic efficiency.
          </div>
        </div>
      )}

      {speedStats.length > 0 && (`;

code = code.replace(seasonEndStr, seasonEndReplace);
code = code.replace(catEndStr, catEndReplace);

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
