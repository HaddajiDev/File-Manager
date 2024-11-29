// routes/text.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = (db) => {
    const textCollection = db.collection('texts');
    const statusCollection = db.collection('status');
    router.post('/upload', async (req, res) => {
        try {
            const ServerStatus = await statusCollection.findOne({_id : "server_status"});
            if(ServerStatus.status === "offline"){
                return res.send("server is offline");
            }
            const current = req.body.text;
            const newText = {
                text: current,
                Date: new Date()
            };
            await textCollection.insertOne(newText);

            res.status(201).send("text uploaded successfully");
        } catch (error) {
            console.error(error);
            res.status(500).send("error while uploading text");
        }
    });

    router.get('/all', async(req, res) => {
        try {
            const ServerStatus = await statusCollection.findOne({_id : "server_status"});
            if(ServerStatus.status === "offline"){
                return res.send("server is offline");
            }
            
            const allTexts = await textCollection.find().toArray();
            const texts = allTexts.map((el, index) => `${index} - ${el.text}`).join('\n');
            res.send(texts);
            
        } catch (error) {
            
        }
    });

    router.delete('/delete/:index', async(req, res) => {
        try {
            const ServerStatus = await statusCollection.findOne({_id : "server_status"});
            if(ServerStatus.status === "offline"){
                return res.send("server is offline");
            }

            let index = parseInt(req.params.index);
            const allTexts = await textCollection.find().toArray();

            const textDelete = allTexts[index];

            if(textDelete){
                await textCollection.findOneAndDelete({_id: textDelete._id});
                return res.send("text deleted successfully");
            }           

            res.send("error deleting text");
            
        } catch (error) {
            
        }
    })

    return router;
};
