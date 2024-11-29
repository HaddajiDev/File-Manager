const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const statusCollection = db.collection('status');

    router.get('/status', async (req, res) => {
        try {
            const statusDoc = await statusCollection.findOne({ _id: "server_status" });
            if (statusDoc) {
                res.send(`Server is ${statusDoc.status}`);
            } else {
                const newStatus = {
                    _id: "server_status",
                    status: "online"
                }
                await statusCollection.insertOne(newStatus);
                
                res.send(`Server is online`);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Error getting server status.");
        }
    });


    router.patch('/status', async (req, res) => {
        const value = req.body.value;

        if (!value || (value !== "online" && value !== "offline")) {
            return res.status(400).send("Invalid status value. Use 'online' or 'offline'.");
        }

        try {
            const result = await statusCollection.updateOne(
                { _id: "server_status" },
                { $set: { status: value } },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                res.send("Server status document created and updated successfully.");
            } else {
                res.send("Server status updated successfully.");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Error while changing the server status.");
        }
    });

    return router;
};
