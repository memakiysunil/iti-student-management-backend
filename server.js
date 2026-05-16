require('dotenv').config();
const app = require('./app');
const mongoose = require('./config/db');
const PORT = process.env.PORT || 3000;

app.listen(PORT,() =>{
    console.log(`listening on ${PORT}`);
})