const express = require('express');
const path = require('path');
const { createTask } = require('../models/task');
const router = express.Router();
const db = require('../db');

// Middleware to protect routes
function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// 🔹 View all tasks assigned to the user
router.get('/', authMiddleware, (req, res) => {
  const userId = req.session.userId;

  db.all(
    `SELECT tasks.*, projects.name AS project_name
     FROM tasks
     JOIN projects ON tasks.project_id = projects.id
     WHERE assignee_id = ?`,
    [userId],
    (err, tasks) => {
      if (err) return res.send('Error loading tasks');
      res.render('tasks-overview', { tasks });
    }
  );
});

// 🔹 View tasks due today
router.get('/today', authMiddleware, (req, res) => {
  const userId = req.session.userId;
  const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD

  db.all(
    `SELECT tasks.*, projects.name AS project_name
     FROM tasks
     JOIN projects ON tasks.project_id = projects.id
     WHERE assignee_id = ? AND due_date = ?`,
    [userId, today],
    (err, tasks) => {
      if (err) return res.send('Error loading today\'s tasks');
      res.render('tasks-today', { tasks });
    }
  );
});

// 🔹 Create task from project
router.get('/create/:projectId', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'create-task.html'));
});

router.post('/create/:projectId', authMiddleware, (req, res) => {
  const { title, description, assignee_id, priority, status, due_date } = req.body;
  const project_id = req.params.projectId;

  createTask({ project_id, title, description, assignee_id, priority, status, due_date }, err => {
    if (err) return res.send('Error creating task');
    res.redirect('/dashboard');
  });
});

// 🔹 Assign task to user
router.get('/assign/:userId', authMiddleware, (req, res) => {
  const userId = req.params.userId;

  db.get(`SELECT first_name, last_name FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err || !user) return res.send('User not found');

    db.all(`SELECT id, name FROM projects`, (err2, projects) => {
      if (err2) return res.send('Error loading projects');

      res.render('assign-task', {
        userId,
        userName: `${user.first_name} ${user.last_name}`,
        projects
      });
    });
  });
});

router.post('/assign/:userId', authMiddleware, (req, res) => {
  const { title, description, project_id, priority, status, due_date } = req.body;
  const assignee_id = req.params.userId;

  db.run(
    `INSERT INTO tasks (title, description, project_id, assignee_id, priority, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, project_id, assignee_id, priority, status, due_date],
    err => {
      if (err) return res.send('Error assigning task');
      res.redirect('/dashboard');
    }
  );
});

module.exports = router;
