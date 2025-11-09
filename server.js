const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));


app.listen(3000, function () {
    console.log("server started at 3000");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

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