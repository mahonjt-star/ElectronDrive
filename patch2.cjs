const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

code = code.replace(
  "for (const id of Array.from(selectedIds)) {\n                      await updateDoc(doc(db, 'trips', id)",
  "for (const id of Array.from(selectedIds as Set<string>)) {\n                      await updateDoc(doc(db, 'trips', id)"
);

code = code.replace(
  "for (const id of Array.from(selectedIds)) {\n                        await deleteDoc(doc(db, 'trips', id)",
  "for (const id of Array.from(selectedIds as Set<string>)) {\n                        await deleteDoc(doc(db, 'trips', id)"
);

fs.writeFileSync('src/components/HistoryTab.tsx', code);
