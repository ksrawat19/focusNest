const db = require('../db');

function createTask({ project_id, title, description, assignee_id, priority, status, due_date }, callback) {
  db.run(
    `INSERT INTO tasks (project_id, title, description, assignee_id, priority, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [project_id, title, description, assignee_id, priority, status, due_date],
    callback
  );
}

module.exports = { createTask };
