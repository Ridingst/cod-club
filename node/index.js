const express = require('express')
const app = express()
const path = require('path')

const port = process.env.PORT || 8080;

app.use('/images', express.static(path.join(__dirname + '/html/static/images/')))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.get('/players_data.js', function(req, res) {
    res.set('Cache-control', `no-store, no-cache, max-age=0`);
    res.sendFile(path.join(__dirname + '/data/players_data.js'));
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))