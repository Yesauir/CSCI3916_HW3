var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var jwt = require('jsonwebtoken');
var cors = require('cors');

var Movie =require('./Movies');

var app = express();
module.exports = app; // for testing
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    //userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, message: 'Authentication failed.'});
            }
        });


    });
});


router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        if (!req.body.title || !req.body.releaseYear || !req.body.genre) {
            console.log("Error. Title, releaseYear or genre not found!");
            res.json({success: false, message: "Error. Title, release year or genre not found!"});

        }

        //var howManyActors = JSON.parse(req);

        else if (!req.body.actors[2]) {
            console.log("Error. Each movie requires 3 actors!");
            res.json({success: false, message: "Error. Each movie requires 3 actors!"});
        }

        //this is a change.

        else{
            var movie = new Movie();
            movie.title = req.body.title;
            movie.genre = req.body.genre;
            movie.releaseYear = req.body.releaseYear;
            movie.actors = req.body.actors;

            movie.save(function (err) {
                if (err) {
                    console.log("Error! Movie already exists. weeoo weeoo.");
                    res.json({success: false, message: "Error! Movie already exists. weeoo weeoo."})
                } else {
                    res.json({success: true, message: "New movie created!!"});
                }


            });
        }


    })

    .get(authJwtController.isAuthenticated, function (req, res){
        Movie.find(function(err, movies){
            if(err){
                console.log("There was an error getting movie :(");
                res.json({success: false, message :"There was an error getting movie :("})
            }

            else{
                console.log("You got a movieeeeee");
                res.json(movies);
            }
        });
    })

    .put(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        if (!req.body.title || !req.body.att || !req.body.update) {
            console.log("Error. One or more field is missing from update");
            return res.error;
        }

        var update = req.body.att;
        var objUpdate = {};
        objUpdate[update] = req.body.update;

        Movie.findOneAndUpdate({title: req.body.title}, objUpdate, function (err, status) {
            if (err) {
                res.json({error: err});
            } else {
                res.json({success: true, message: 'Movie has been updated successfully!'});
            }

        });

    })


    .delete(authJwtController.isAuthenticated, function (req, res){
        Movie.findOneAndDelete({title: req.body.title}, function (err, movie) {
            if (err)
            {
                res.status(400).json({success: false, message: "Error!"})
            }
            else if(movie == null)
            {
                res.json({success: false, message : "Movie not found"})
            }
            else{
                res.json({success: true, message :"Movie has been deleted!"})}
        });
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
