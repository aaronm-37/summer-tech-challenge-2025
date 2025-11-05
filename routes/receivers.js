const express = require('express');
const router = express.Router();
const db = require('../db');

// Get receiver by id with history
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const receiver = await db.get('SELECT id, name, balance FROM receivers WHERE id = ?', [id]);
    if (!receiver) return res.status(404).json({ error: 'receiver not found' });

    const operations = await db.all('SELECT * FROM operations WHERE receiver_id = ? ORDER BY id DESC', [id]);

    res.json({ receiver, operations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;


// Create a new receiver
router.post('/', async (req, res) => {
  try {
    const { name, balance } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const initialBalance = Number.isInteger(balance) ? balance : 0;

    const info = await db.run('INSERT INTO receivers (name, balance) VALUES (?, ?)', [name, initialBalance]);
    const receiver = await db.get('SELECT id, name, balance FROM receivers WHERE id = ?', [info.lastID]);
    res.status(201).json(receiver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});
