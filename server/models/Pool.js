const mongoose = require('mongoose');
const PoolSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Links pool to a specific user
    poolId: { type: String, required: true }, // e.g., "Team-Gift-Pool"
    budget: { type: Number, default: 5000 },
    payments: { type: Map, of: Number, default: {} }
});
module.exports = mongoose.model('Pool', PoolSchema);