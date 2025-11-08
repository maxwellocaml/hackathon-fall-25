const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const THREE = require('three');
const app = express();

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


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

//testing 4
//https://threejs.org/manual/#en/creating-a-scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;



//animation loop
function animate() {
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
