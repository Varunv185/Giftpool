const router = require('express').Router();
const Pool = require('../models/Pool');

// Get a specific pool for a user
router.get('/:userId/:poolId', async (req, res) => {
    try {
        const pool = await Pool.findOne({ userId: req.params.userId, poolId: req.params.poolId });
        res.json(pool || { budget: 5000, payments: {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save or update a pool
router.post('/save', async (req, res) => {
    try {
        const { userId, poolId, budget, payments } = req.body;
        const updatedPool = await Pool.findOneAndUpdate(
            { userId, poolId },
            { budget, payments },
            { new: true, upsert: true } // Creates it if it doesn't exist
        );
        res.json(updatedPool);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;