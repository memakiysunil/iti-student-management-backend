require('dotenv').config();
const app = require('./app');
const mongoose = require('./config/db');
const PORT = process.env.PORT || 5000;

app.listen(PORT,() =>{
    console.log(`listening on ${PORT}`);
})