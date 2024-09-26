// routes/text.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = (db) => {
    const textCollection = db.collection('texts');
    router.post('/upload', async (req, res) => {
        try {
            const current = req.body.text;
            const newText = {
                text: current,
                Date: new Date()
            };
            await textCollection.insertOne(newText);

            res.status(201).send({ msg: "Done" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ msg: "Not Done" });
        }
    });

    return router;
};
