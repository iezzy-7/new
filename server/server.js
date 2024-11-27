const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original file name
    }
});
const upload = multer({ storage: storage });

// Messages storage
let messages = []; // Store messages as an array of objects

app.post('/send-message', upload.single('file'), (req, res) => {
    const { recipient, message, sender } = req.body;
    const fileName = req.file ? req.file.originalname : null; // Keep the original file name

    if (recipient && message) {
        messages.push({ sender, recipient, message, file: fileName });
        res.json({ status: 'Message sent' });
    } else {
        res.status(400).json({ status: 'Error: No recipient or message provided' });
    }
});

app.get('/messages', (req, res) => {
    const { sender, recipient } = req.query;
    const filteredMessages = messages.filter(msg => 
        (msg.sender === sender && msg.recipient === recipient) || 
        (msg.sender === recipient && msg.recipient === sender)
    );
    res.json(filteredMessages);
});

// Endpoint to download files
app.get('/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', fileName);
    res.download(filePath, fileName, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});