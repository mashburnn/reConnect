// to run:
// make sure node.js is installed in your terminal
// then just run "node index.js"

const sqlite = require('sqlite3');
const http = require('http');
const express = require('express');
const sio = require('socket.io');
const path = require('path');

// will need to import classes here once made (User.js and Post.js files)

var app = express();
var server = http.Server(app);
var io = sio(server);

let htmlDirectory = path.resolve(__dirname);
app.use(express.static(htmlDirectory));
server.listen(412401);

// note: to access the interface (once we have one), use this URL in your browser after running index.js:
// localhost:412401

// interfacing with front end
io.on('connection', (socket)=>{
    // handlers for messages from the front end go inside here

    // for example:
    socket.on('test', (data)=>{ // 'test' is the message from the front end, data is also from frontend
        // do something with data here, etc etc
        console.log("test signal received\n");
    });
})