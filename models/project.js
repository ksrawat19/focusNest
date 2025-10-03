const db = require('../db');

function createProject({ name, description, owner_id, start_date, end_date }, callback) {
  db.run(
    `INSERT INTO projects (name, description, owner_id, start_date, end_date)
     VALUES (?, ?, ?, ?, ?)`,
    [name, description, owner_id, start_date, end_date],
    callback
  );
}

module.exports = { createProject };
