const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (db, bucket) => {
    const files_collection = db.collection('uploads.files');
    router.post('/upload', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded' });
        }

        try {
            const readableStream = new Readable();
            readableStream.push(req.file.buffer);
            readableStream.push(null);

            const uploadStream = bucket.openUploadStream(req.file.originalname);

            readableStream.pipe(uploadStream)
                .on('error', (error) => {
                    console.error('Error uploading file:', error);
                    return res.status(500).send({ error: 'File upload failed' });
                })
                .on('finish', () => {
                    res.status(200).send({ msg: 'File uploaded successfully' });
                });

        } catch (error) {
            console.error('Error during file upload:', error);
            res.status(500).send({ error: 'Server error' });
        }
    });

    router.get('/download/:id', (req, res) => {
        try {
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

    router.get('/all', async(req, res) => {
        try {
            const files = await files_collection.find({}, 
                {projection: {_id : 1, filename: 1}}
            ).toArray();
            res.status(200).json(files);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error Loading files.');
        }
    });

    return router;
};
