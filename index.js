const express = require('express');
const cors = require('cors');

require('dotenv').config();

const connect = require('./db_connect');
const fileRoutes = require('./routes/file');
const textRoute = require('./routes/text');
const { GridFSBucket } = require('mongodb');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


(async () => {
    try {
        const db = await connect();
        const bucket = new GridFSBucket(db, {
            bucketName: 'uploads'
        });
        
        app.use('/files', fileRoutes(db, bucket));
        app.use('/text', textRoute(db));

        app.get("/", (req, res) => res.send("Working"));

        app.listen(process.env.PORT, () => {
            console.log(`server running on ${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to db:', error);
    }
})();
