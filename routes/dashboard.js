const express = require('express');
const db = require('../db');
const router = express.Router();

function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

router.get('/', authMiddleware, (req, res) => {
  const userId = req.session.userId;
  const userName = req.session.userName;

  db.all(`SELECT * FROM projects WHERE owner_id = ?`, [userId], (err, projects) => {
    if (err) return res.send('Error loading projects');

    db.all(`SELECT * FROM tasks WHERE assignee_id = ?`, [userId], (err2, tasks) => {
      if (err2) return res.send('Error loading tasks');

      // Calculate upcoming deadlines (next 7 days)
      const today = new Date();
      const upcoming = tasks.filter(task => {
        const due = new Date(task.due_date);
        const diff = (due - today) / (1000 * 60 * 60 * 24); // days
        return diff >= 0 && diff <= 7;
      });

      res.render('dashboard', {
        userName,
        projects,
        tasks,
        upcomingCount: upcoming.length
      });
    });
  });
});

module.exports = router;
