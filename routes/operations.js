const express = require('express');
const router = express.Router();
const db = require('../db');

function calculateFeeAndNet(gross) {
  const fee = Math.round(gross * 0.03);
  const net = gross - fee;
  return { fee, net };
}

// Create a new operation
router.post('/', async (req, res) => {
  try {
    const { receiver_id, gross_value } = req.body;
    if (!receiver_id || !gross_value || gross_value <= 0) {
      return res.status(400).json({ error: 'receiver_id and gross_value (>0) are required' });
    }

    // check receiver exists
    const receiver = await db.get('SELECT * FROM receivers WHERE id = ?', [receiver_id]);
    if (!receiver) return res.status(404).json({ error: 'receiver not found' });

    const { fee, net } = calculateFeeAndNet(gross_value);

    const info = await db.run(
      'INSERT INTO operations (receiver_id, gross_value, fee, net_value, status) VALUES (?, ?, ?, ?, ?)',
      [receiver_id, gross_value, fee, net, 'pending']
    );

    const op = await db.get('SELECT * FROM operations WHERE id = ?', [info.lastID]);
    res.status(201).json(op);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Get operation by id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const op = await db.get('SELECT * FROM operations WHERE id = ?', [id]);
    if (!op) return res.status(404).json({ error: 'operation not found' });
    res.json(op);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Confirm operation
router.post('/:id/confirm', async (req, res) => {
  try {
    const id = req.params.id;
    const op = await db.get('SELECT * FROM operations WHERE id = ?', [id]);
    if (!op) return res.status(404).json({ error: 'operation not found' });
    if (op.status === 'confirmed') return res.status(409).json({ error: 'operation already confirmed' });

    // update operation status
    await db.run('UPDATE operations SET status = ? WHERE id = ?', ['confirmed', id]);

    // add net_value to receiver balance
    await db.run('UPDATE receivers SET balance = balance + ? WHERE id = ?', [op.net_value, op.receiver_id]);

    const updatedOp = await db.get('SELECT * FROM operations WHERE id = ?', [id]);
    const receiver = await db.get('SELECT * FROM receivers WHERE id = ?', [op.receiver_id]);

    res.json({ operation: updatedOp, receiver });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
