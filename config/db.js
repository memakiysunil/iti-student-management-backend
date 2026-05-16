require('dotenv').config();
const mongoose = require('mongoose');
const url = process.env.MONGO_URL;

mongoose.connect(url)
.then(() => {
    console.log('Database Connected Successfully!');
  })
  .catch((error) => {
    console.log('Error connecting to database:', error);
  });

module.exports = mongoose;
