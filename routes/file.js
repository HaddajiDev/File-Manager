const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (db, bucket) => {
    const files_collection = db.collection('uploads.files');
    const chunks_collection = db.collection('uploads.chunks');
    const statusCollection = db.collection('status');

    function checkPassword(req, res) {
        if (req.query.password !== process.env.PASSWORD) {
            res.status(401).send("Unauthorized: Incorrect password.");
            return false;
        }
        return true;
    }

    router.post('/upload', upload.single('file'), async (req, res) => {
        if (!checkPassword(req, res)) return;

        const ServerStatus = await statusCollection.findOne({ _id: "server_status" });
        if (ServerStatus.status === "offline") {
            return res.send("server is offline");
        }

        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        try {
            const readableStream = new Readable();
            readableStream.push(req.file.buffer);
            readableStream.push(null);

            const uploadStream = bucket.openUploadStream(req.file.originalname);

            readableStream.pipe(uploadStream)
                .on('error', (error) => {
                    console.error('Error uploading file:', error);
                    return res.status(500).send("File upload failed");
                })
                .on('finish', () => {
                    res.status(200).send("File uploaded successfully");
                });

        } catch (error) {
            console.error('Error during file upload:', error);
            res.status(500).send("Error during file upload");
        }
    });

    router.get('/download/:id', async (req, res) => {
        if (!checkPassword(req, res)) return;

        try {
            const ServerStatus = await statusCollection.findOne({ _id: "server_status" });
            if (ServerStatus.status === "offline") {
                return res.send("server is offline");
            }

            const fileId = req.params.id;
            const objectID = new ObjectId(fileId);
            const downloadStream = bucket.openDownloadStream(objectID);

            downloadStream.on('data', (chunk) => {
                res.write(chunk);
            });

            downloadStream.on('end', () => {
                res.end();
            });

            downloadStream.on('error', (err) => {
                console.error('Error downloading file:', err);
                res.status(404).send('File not found.');
            });

        } catch (error) {
            console.error('Error downloading file:', error);
            res.status(500).send('Error downloading file.');
        }
    });

    router.get('/all', async (req, res) => {
        if (!checkPassword(req, res)) return;

        try {
            const ServerStatus = await statusCollection.findOne({ _id: "server_status" });
            if (ServerStatus.status === "offline") {
                return res.send("server is offline");
            }
            const files = await files_collection.find({}, { projection: { _id: 1, filename: 1, length: 1 } }).toArray();
            const fileList = files.map(file => `ID: "${file._id}", Filename: "${file.filename}", size: "${FormatFileSize(file.length)}"`).join('\n');
            
            res.status(200).send(fileList);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error Loading files.');
        }
    });

    router.delete('/delete/:id', async (req, res) => {
        if (!checkPassword(req, res)) return;

        try {
            const ServerStatus = await statusCollection.findOne({ _id: "server_status" });
            if (ServerStatus.status === "offline") {
                return res.send("server is offline");
            }
            const idField = new ObjectId(req.params.id);
            const file = await files_collection.findOne({ _id: idField });
 
            if (!file) {
                return res.status(404).send("File not found");
            }

            const result = await files_collection.deleteOne({ _id: idField });
            await chunks_collection.deleteMany({ files_id: idField });
    
            if (result.deletedCount > 0) {
                return res.status(200).send("File deleted");
            } else {
                return res.status(500).send("Error deleting file");
            }
    
        } catch (error) {
            console.error("Error deleting file:", error);
            return res.status(500).send("Server error occurred while deleting the file");
        }
    });

    return router;
};

function FormatFileSize(bytes) {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return bytes + ' bytes';
    }
}
