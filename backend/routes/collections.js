const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { authenticate } = require('./auth');

// GET /api/collections - list all collections
router.get('/', authenticate, async (req, res) => {
  try {
    const collections = await Collection.find().sort({ date: -1 }).populate('truck bins createdBy');
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections - create new collection
router.post('/', authenticate, async (req, res) => {
  try {
    const collection = new Collection(req.body);
    await collection.save();
    await collection.populate('truck bins createdBy');
    res.status(201).json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
