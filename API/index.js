require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const firebase_admin = require('firebase-admin');
var serviceAccount = require("./taskli-27382-firebase-adminsdk-rfb9s-e9b8c2a15c.json");

//const cors = require("cors");
const config = require("./config/config.js");
var path = require('path');
var session = require('express-session');
const {
    prototype
} = require('events');

const {
    db
} = require('./config/config.js');
const {
    response
} = require('express');

firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
    databaseURL: db.DB_URL
});

const admin = firebase_admin.database();



//session connection
var user;
var login;


const app = express();

//set up templates
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
//save data related to session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.post("/api/newuser", (req, res) => {
    const newuser = {
        name: req.body.name,
        lastname: req.body.lastname,
        password: req.body.password
    }
    admin.ref('users').child(req.body.name + req.body.lastname).set(newuser);
    console.log(req.body);
    res.send("working");
});

app.post("/api/newtask", (req, res) => {
    const newtask = {
        name: req.body.name,
        lastname: req.body.lastname,
        taskname: req.body.taskname,
        level_of_priority: req.body.level_of_priority,
        date_of_completion: req.body.date_of_completion,
        status: req.body.status
    }
    if (login == true && user == req.session.username) {
        admin.ref('users/' + req.body.name + req.body.lastname + '/tasks/' + req.body.taskname).set(newtask);
        res.send("working");
    } else
        res.send("not working");
});

app.get("/api/login", (req, res) => {
    if (login == true && user == req.session.username)
        console.log("heavy");
    else
        console.log("fail");
});

app.post('/api/auth', function (request, response) {
    var username = request.body.name;
    var password = request.body.password;
    if (username && password) {
        admin.ref('users').orderByKey().once("value")
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot, err) {
                    // key will be "ada" the first time and "alan" the second time
                    var key = childSnapshot.key;
                    // childData will be the actual contents of the child
                    var childData = childSnapshot.val();
                    try {
                        if (childData.name == username && childData.password == password) {
                            request.session.loggedin = true;
                            login = true;
                            request.session.username = username;
                            user = username;
                            response.status(200).json({
                                message: 'ok'
                            });
                        }
                    } catch (err) {
                        response.status(400).json({
                            message: 'not ok'
                        });
                        console.log(err);
                        console.log(err.stack);
                    }
                });
            });
    } else {
        response.send('Please enter Name and Password!');
        //response.end();
    }
});

app.get("/api/deleteuser/:id", function (request, response) {
    if (login == true && user == request.session.username) {
        admin.ref("users/" + request.params.id).remove();
        response.send("deleted");
    } else
        response.send("not deleted");
});

app.get("/api/deletetask/:id", function (request, response) {
    if (login == true && user == request.session.username) {
        admin.ref("tasks/" + request.params.id).remove();
        res.send("deleted");
    } else
        response.send("not deleted");
});



// LOGIN PAGE

// app.get("/", (req, res) => {
//     if (login == true && user == req.session.username)
//         res.redirect('/home');
//     else
//         res.render(__dirname + '/views/login');
//     console.log("login")
// });
// get date
var today = new Date();
var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date + ' ' + time;



// 404 Route (ALWAYS last route)
app.get('*', function (req, res) {
    res.render(__dirname + '/views/404');
});
// set port, listen for requests
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})