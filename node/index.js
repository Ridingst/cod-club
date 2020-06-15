const express = require('express')
const app = express()
const path = require('path');
const { type } = require('os');
var MongoClient = require('mongodb').MongoClient;

if(process.env.DEVELOPMENT == 'True'){
    console.log('Loading from .env')
    
    var dotenv = require('dotenv');
    var result = dotenv.config({ path: path.resolve(__dirname, '../.env') });
    
    if (result.error) {
        throw result.error
    }
}

const port = process.env.PORT || 8080;

const mongo_user = process.env.MONGO_INITDB_ROOT_USERNAME
const moongo_pass = process.env.MONGO_INITDB_ROOT_PASSWORD
const mongo_host = process.env.MONGO_HOST || 'mongodb:27017'

var mongoURL = 'mongodb://' + mongo_user + ':' + moongo_pass + '@' + mongo_host

var usernames = process.env.COD_PLAYERS.split(',')

console.log(mongoURL);

app.use('/images', express.static(path.join(__dirname + '/html/static/images/')))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.get('/players_data.js', function(req, res) {
    res.set('Cache-control', `no-store, no-cache, max-age=0`);
    res.sendFile(path.join(__dirname + '/data/players_data.js'));
});

app.get('/players_data', function(req, res) {
    MongoClient.connect(mongoURL, function(err, db) {
        if (err) throw err;
        var dbo = db.db("user_data");
        var stats = dbo.collection('stats');

        console.log('connection established')
    
        stats.aggregate([
            {$match: {'username': {$in: usernames}}},            
            {$group: {'_id': '$username', 'stats': {$last: '$stats.calcStats'}, 'date': {$last: '$date'}}}
        ]).toArray(function(err, data){
            if(err) throw err;
            console.log('returning data')
            res.send(data)
        })
    });
})

app.get('/last_updated', function(req, res) {
    MongoClient.connect(mongoURL, function(err, db) {
        if (err) throw err;
        var dbo = db.db("user_data");
        var stats = dbo.collection('stats');

        stats
        .find()
        .sort({$natural: -1})
        .limit(1)
        .next()
        .then(
          function(doc) {
                var dt = new Date(doc.date);
                var dt_string = `${
                        dt.getDate().toString().padStart(2, '0') }/${
                        (dt.getMonth()+1).toString().padStart(2, '0') }/${
                        dt.getFullYear().toString().padStart(4, '0') } ${
                        dt.getHours().toString().padStart(2, '0') }:${
                        dt.getMinutes().toString().padStart(2, '0') }:${
                        dt.getSeconds().toString().padStart(2, '0')
                }`
                res.send(dt_string)
          },
          function(err) {
            console.log('Error:', err);
          }
        );
    });
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))