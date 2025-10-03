const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'focusnest.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Database deleted.');
} else {
  console.log('No database found.');
}
