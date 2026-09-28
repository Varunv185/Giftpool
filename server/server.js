const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas (using your direct connection string)
mongoose.connect("mongodb+srv://varunverma36149_db_user:Mmu1pufuQhudkSmN@cluster0.cw7pgap.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.log('DB Error:', err));

// Register your backend routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pools', require('./routes/poolRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));