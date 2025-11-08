const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const three = require('three');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));


app.listen(3000, function () {
    console.log("server started at 3000");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

mongoose.connect('mongodb://localhost:27017/movieDB', {})
    .then(function (db) {
        console.log("db connected");
    });
