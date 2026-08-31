const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

// I also need an unbundling state
code = code.replace(
  "const [isBundling, setIsBundling] = useState(false);",
  "const [isBundling, setIsBundling] = useState(false);\n  const [isUnbundling, setIsUnbundling] = useState(false);"
);

const footerRegex = /<div className="flex flex-wrap items-center justify-between gap-3 w-full">\s*<span className="text-sm font-bold text-white">\{selectedIds\.size\} trips selected<\/span>\s*<div className="flex items-center gap-2">\s*\{selectedIds\.size >= 2 && \(\s*<Button variant="secondary" onClick=\{[^}]+\}>\s*<Route className="h-4 w-4 mr-2" \/> Bundle\s*<\/Button>\s*\)\}/m;

if (footerRegex.test(code)) {
    const newFooter = `<div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <span className="text-sm font-bold text-white">{selectedIds.size} trips selected</span>
              <div className="flex items-center gap-2">
                {Array.from(selectedIds).some(id => trips.find(t => t.id === id)?.tripType === 'Road Trip') && (
                  <Button variant="outline" disabled={isUnbundling} onClick={async () => {
                    setIsUnbundling(true);
                    try {
                      for (const id of Array.from(selectedIds as Set<string>)) {
                        await updateDoc(doc(db, 'trips', id), { tripType: 'Single', roadTripName: '' });
                      }
                      setSelectedIds(new Set());
                      setSelectionMode(false);
                    } catch (err) {
                      console.error('Unbundle failed', err);
                    }
                    setIsUnbundling(false);
                  }}>
                    {isUnbundling ? 'Unbundling...' : 'Un-Bundle'}
                  </Button>
                )}
                {selectedIds.size >= 2 && (
                  <Button variant="secondary" onClick={() => setShowBundleInput(true)}>
                    <Route className="h-4 w-4 mr-2" /> Bundle
                  </Button>
                )}`;
    
    code = code.replace(footerRegex, newFooter);
    fs.writeFileSync('src/components/HistoryTab.tsx', code);
    console.log("Success");
} else {
    console.log("Regex did not match");
}
