const express = require('express');
const fs = require('fs');
const moment = require('moment-timezone');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const messagesFile = 'messages.json';

function isNewYear() {
    const philippinesTime = moment.tz("Asia/Manila");
    return philippinesTime.month() === 0 && philippinesTime.date() === 1 && philippinesTime.hours() === 0 && philippinesTime.minutes() === 0;
}

app.post('/sendMessage', (req, res) => {
    const { nickname, message } = req.body;
    if (!nickname || !message) {
        return res.status(400).json({ message: 'Nickname and message are required.' });
    }

    const newMessage = { nickname, message, timestamp: new Date().toISOString() };

    fs.readFile(messagesFile, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
            messages = JSON.parse(data);
        }
        messages.push(newMessage);
        fs.writeFile(messagesFile, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save message' });
            }
            res.status(200).json({ message: 'Message saved' });
        });
    });
});

app.get('/viewMessages', (req, res) => {
    if (!isNewYear()) {
        return res.status(403).json({ message: 'Messages can only be viewed at 12:00 AM on January 1st' });
    }

    const password = req.query.password;
    if (password !== 'NewYear2025') {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    fs.readFile(messagesFile, 'utf8', (err, data) => {
        if (err || !data) {
            return res.status(500).json({ message: 'Failed to load messages' });
        }
        res.json(JSON.parse(data));
    });
});

app.listen(port, () => {
    console.log(`Server running on port:${port}`);
});

