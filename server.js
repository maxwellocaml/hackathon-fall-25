const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

mongoose.connect('mongodb://localhost:27017/ObjDB', {})
    .then(function (db) {
        console.log("ObjDB Connected");
    });

const PORT = 3000;
app.listen(PORT, function () {
    console.log("Server running at http://localhost:" + PORT);
});


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

// Serve a basic API response
app.get('/api', (req, res) => {
    res.json({ message: 'Hello from Vite and Node.js!' });
});

//mongoose schemas and models
const rockSchema={
    mineral:{
        type:String,
        required:true,
    },
    totalWeight:{
        type:Number,
        min:0,
        max:100000,
        required:true,
    },
    amount:{
        type:Number,
        min:0,
        max:100,
        required:true,
    },
    processed:{
        type:String,
    },
    url:{
        type:String,
    }
}
const containerSchema = {
    name:{
        type:String,
        required:true,
    },
    capacity:{
        type:Number,
        min:1,
        max:1000,
        required:true,
    },
    fulfilled:{
        type:Number,
        min:0,
        max:1000,
        required:true,
    },
    contents: [{
        type:String,
    }]
}
const Rock=mongoose.model('Rock',rockSchema, 'rocks');
const Container=mongoose.model('Container', containerSchema, 'containers');

app.post('/addNewObj', express.json(), async (req, res) => {
    const client = await MongoClient.connect("mongodb://localhost:27017/");
    const result = await client.db("ObjDB").collection("items").insertOne(req.body);
    res.json({ id: result.insertedId });
    await client.close();
});
app.get('/getAllObjs', async (req, res) => {
    const client = await MongoClient.connect("mongodb://localhost:27017/");
    const items = await client.db("ObjDB").collection("items").find({}).toArray();
    res.json(items);
    await client.close();
});
app.delete('/deleteObj/:id', express.json(), async (req, res) => {
    const client = await MongoClient.connect("mongodb://localhost:27017/");
    const result = await client.db("ObjDB").collection("items").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: result.deletedCount > 0 });
    await client.close();
});


app.post('/create-Container', function (req, res) {
    const containerInfo = {
        name: req.body.name,
        capacity: (req.body.length * req.body.width * req.body.height),
        fulfilled: 0, //empty upon creation
        contents: [] //empty array upon creation
    }
    console.log(containerInfo)

    //create container
    const newContainer = new Container(containerInfo);
    newContainer.save().then(container => {
        console.log(container._id);
        res.send({"message": "success"});
    }).catch(err => {
        console.log(err);
        res.send({"message": err.message});
    })

});

app.post('/create-Rock', function (req, res) {
    const rockInfo = {
        mineral: req.body.mineral,
        totalWeight: req.body.totalWeight,
        amount: req.body.amount,
        processed: req.body.processed,
        url: req.body.url
    }

    console.log(rockInfo)

    //create rock
    const newRock = new Rock(rockInfo);
    newRock.save().then(rock => {
        console.log(rock._id);
        res.send({"message": "success"});
    }).catch(err => {
        console.log(err);
        res.send({"message": err.message});
    })

});