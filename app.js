require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorMiddleware');
const app = express();

const userRouter = require('./routes/userRoutes');
 
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "ITI Backend API Running 🚀"
    });
}) 

app.use('/user', userRouter);
 
 
app.use(errorHandler);

module.exports = app;