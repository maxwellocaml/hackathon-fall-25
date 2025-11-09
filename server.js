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
        console.log("db connected");
    });


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


app.post('/save-headline', function (req, res) {
    const updated_headline = {
        title: req.body.title,
        author: req.body.author,
        content: req.body.content,
    }
    const news_id = req.body._id;
    console.log(news_id)
    if (!news_id){
        //no id, create entry
        const newHeadline = new News(updated_headline);
        newHeadline.save().then(new_headline => {
            console.log(new_headline._id);
            res.redirect('/get-headline-detail?news_id=' + newHeadline._id);
        }).catch(err => {
            console.log(err);
            res.redirect("/save-headline?error_message="+err['message']+"&input="+JSON.stringify(newHeadline));
        })
    }else{
        //id, update entry
        News.updateOne(
            {_id: news_id},
            {$set: updated_headline},
            {runValidators: true}
        ).then(new_headline => {
            res.redirect('/get-headline-detail?news_id=' + news_id);
        }).catch(err => {
            console.log(err);
            res.redirect("/save-headline?error_message="+err['message']+"&input="+JSON.stringify(updated_headline)+"&news_id="+news_id);
        })
    }
});