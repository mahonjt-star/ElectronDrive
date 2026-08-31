const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

// Add state variables
code = code.replace(
  "const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);",
  "const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);\n  const [showBundleInput, setShowBundleInput] = useState(false);\n  const [bundleName, setBundleName] = useState('');\n  const [isBundling, setIsBundling] = useState(false);"
);

// Replace selectionMode UI block
const oldBlockStart = '{selectionMode && selectedIds.size > 0 && (';
const oldBlockRegex = /\{selectionMode && selectedIds\.size > 0 && \(\s*<div className="sticky bottom-0 left-0 right-0 mt-4 p-4 glass-card bg-black\/80 border-t border-red-500\/30 flex items-center justify-between animate-in slide-in-from-bottom-4">[\s\S]*?<\/div>\s*\)\}/;

const newBlock = `{selectionMode && selectedIds.size > 0 && (
        <div className="sticky bottom-0 left-0 right-0 mt-4 p-4 glass-card bg-black/90 border-t border-[#00D1FF]/30 flex flex-col gap-3 animate-in slide-in-from-bottom-4 z-50">
          {showBundleInput ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="text-sm font-bold text-[#00D1FF]">Name this Road Trip</div>
              <input 
                type="text" 
                className="input-field bg-black/50 border-[#00D1FF]/30 text-white" 
                placeholder="e.g. Great Ocean Road" 
                value={bundleName} 
                onChange={e => setBundleName(e.target.value)} 
                autoFocus 
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="ghost" onClick={() => setShowBundleInput(false)}>Cancel</Button>
                <Button variant="primary" disabled={isBundling || !bundleName.trim()} onClick={async () => {
                  setIsBundling(true);
                  try {
                    for (const id of Array.from(selectedIds)) {
                      await updateDoc(doc(db, 'trips', id), { tripType: 'Road Trip', roadTripName: bundleName.trim() });
                    }
                    setSelectedIds(new Set());
                    setSelectionMode(false);
                    setShowBundleInput(false);
                    setBundleName('');
                  } catch (err) {
                    console.error('Bundle failed', err);
                  }
                  setIsBundling(false);
                }}>
                  {isBundling ? 'Saving...' : 'Bundle Trips'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <span className="text-sm font-bold text-white">{selectedIds.size} trips selected</span>
              <div className="flex items-center gap-2">
                {selectedIds.size >= 2 && (
                  <Button variant="secondary" onClick={() => setShowBundleInput(true)}>
                    <Route className="h-4 w-4 mr-2" /> Bundle
                  </Button>
                )}
                <Button 
                  variant="danger" 
                  onClick={async () => {
                    if (!showBulkDeleteConfirm) {
                      setShowBulkDeleteConfirm(true);
                      setTimeout(() => setShowBulkDeleteConfirm(false), 3000);
                      return;
                    }
                    setBulkDeleting(true);
                    try {
                      for (const id of Array.from(selectedIds)) {
                        await deleteDoc(doc(db, 'trips', id));
                      }
                      setSelectedIds(new Set());
                      setSelectionMode(false);
                      setShowBulkDeleteConfirm(false);
                    } catch (err) {
                      console.error('Bulk delete failed', err);
                    }
                    setBulkDeleting(false);
                  }}
                  disabled={bulkDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {bulkDeleting ? 'Deleting...' : showBulkDeleteConfirm ? 'Confirm Delete' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}`;

if (oldBlockRegex.test(code)) {
  code = code.replace(oldBlockRegex, newBlock);
  fs.writeFileSync('src/components/HistoryTab.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Regex did not match');
}
