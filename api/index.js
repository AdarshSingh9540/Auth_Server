const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRouter = require('./routes/userRoutes');
const loggerMiddleware = require('./middleware/loggerMiddleware');

require('dotenv').config();


app.use(express.json());


app.use(express.urlencoded({ extended: true }));

app.use(loggerMiddleware)
app.use('/api', userRouter);


mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));
app.get('/', (req, res) => {
    res.send({
        message: "Hello From Adarsh Singh"
    });
});


const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`Port is listening on ${port}`);
});
