const fs=require('fs');
const mongoose = require('mongoose');
const csv_parse = require('csv-parse/sync');

//parse CSV files for data
const rawRockData=fs.readFileSync(__dirname+'/rockdata.csv','utf8');
const parsedRockData = csv_parse.parse(rawRockData, {
    columns: true,
    skip_empty_lines: true,
});
const rawContainerData=fs.readFileSync(__dirname+'/containerdata.csv','utf8');
const parsedContainerData = csv_parse.parse(rawContainerData, {
    columns: true,
    skip_empty_lines: true,
});

//connect to mongoDB
mongoose.connect('mongodb://localhost:27017/ObjDB', {})
    .then(function (db) {
        console.log("db connected");
    });

//define mongoose Schemas for container + 1 object type: rock
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
        max:100,
        required:true,
    },
    fulfilled:{
        type:Number,
        min:0,
        max:100,
        required:true,
    },
    contents: [{
        type:String,
    }]
}

//define mongoose models
const Rock=mongoose.model('Rock',rockSchema, 'rocks');
const rockList=[];
const Container=mongoose.model('Container', containerSchema, 'containers');
const containerList=[];

//push csv data to arrays
parsedRockData.forEach(rock=>{
    rockList.push({
        mineral: rock.mineral,
        totalWeight: rock.totalWeight,
        amount: rock.amount,
        processed: rock.processed,
        url: rock.url
    });
});
parsedContainerData.forEach(container=>{
    containerList.push({
        name: container.name,
        capacity: container.capacity,
        fulfilled: container.fulfilled,
        contents: container.contents,
    });
});

//insert array data to MongoDB collections
Rock.insertMany(rockList).then(rocks=>{
    mongoose.connection.close();
}).catch(err => {
    console.log(err);
});
Container.insertMany(containerList).then(containers=>{
    mongoose.connection.close();
}).catch(err => {
    console.log(err);
});