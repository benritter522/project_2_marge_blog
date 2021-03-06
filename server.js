// DON'T FORGET THE WIREFRAME

// MAKE A CONTROLLER FOLDER AND FILE LATER AND MOVE THE ROUTES INTO IT

if(process.env.NODE_ENV === 'development') { 
    require('dotenv').config();
}
// console.log(process.env.MONGODB_URI);
// console.log(process.env);

// ======================================================================================
//                                  DEPENDENCIES
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
const express = require('express');
const methodOverride  = require('method-override');
const mongoose = require('mongoose');
const app = express();
const db = mongoose.connection;
const Plant = require('./models/plants.js');
// const show = console.log;
// show('yasssss');

// ======================================================================================
//                                  MIDDLEWARE
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// Allow use of Heroku's port or your own local port, depending on the environment
const PORT = process.env.PORT || 3000;

// ======================================================================================
//                                  DATABASE
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// How to connect to the database either via heroku or locally
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to Mongo
mongoose.connect(MONGODB_URI ,  { useNewUrlParser: true, useUnifiedTopology: true});

// Error / success
db.on('error', (err) => console.log(err.message + ' is Mongod not running?'));
db.on('connected', () => console.log('mongo connected: ', MONGODB_URI));
db.on('disconnected', () => console.log('mongo disconnected'));

// open the connection to mongo
db.on('open' , ()=>{});

// ======================================================================================
//                                  MIDDLEWARE
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

//use public folder for static assets
app.use(express.static('public'));

// populates req.body with parsed info from forms - if no data from forms will return an empty object {}
app.use(express.urlencoded({ extended: true }));// extended: false - does not allow nested objects in query strings
app.use(express.json());// returns middleware that only parses JSON - may or may not need it depending on your project

// making checkboxes easier
app.use((req, res, next) => {
    req.body.hasFungusGnats = req.body.hasFungusGnats === 'on' ? true : false;
    next();
})

//use method override
app.use(methodOverride('_method'));// allow POST, PUT and DELETE from a form
// replaced by method-override
// app.use((req, res, next) => {
//     if(req.query._method) console.log('change my method'); 
//     next(); // **** VERY IMPORTANT ****
// })

// ======================================================================================
//                              SET UP VIEW ENGINE
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// *** WITHOUT THIS MY RENDER WON'T WORK ***
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

// ======================================================================================
//                                  NON-RESTFUL ROUTES
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

//Home on heroku main page or localhost:3000 
app.get('/' , (req, res) => {
    res.render('Home');
});

app.get('/contact', (req, res) => {
    res.render('Contact');
});

app.get('/about', (req, res) => {
    res.render('About');
})

// ======================================================================================
//                  REST ROUTES - "REpresentational State Transfer" - INDUCES
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//     -    INDEX   -   NEW -   DELETE  -   USE -   CREATE  -   EDIT    -   SHOW    -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// Index '/<nameOfResource>/new' GET
app.get('/plants/', (req, res) => {
    // res.send('hello index');
    Plant.find({}, (err, allPlants) => {
        if(!err) {
            res.render('Index', {
                plants: allPlants
            });
        } else {
            res.send(err);
        }
    })
})

// New '/<nameOfResource>/new' GET
app.get('/plants/new', (req, res) => {
    res.render('New');
});

// Delete '/<nameOfResource>/:id' DELETE
app.delete('/plants/:id', (req, res) => {
    Plant.findByIdAndRemove(req.params.id, (err, _) => { // don't need foundPlant, put an underscore as a 'don't need it' placeholder 
        if(!err) {
            res.redirect('/plants');
        } else {
            res.send(err);
        }
    })
})

// Update '/<nameOfResource>/:id' PUT
app.put('/plants/:id', (req, res) => {
    Plant.findByIdAndUpdate(req.params.id, req.body, (err, updatedPlant) => {
        if(!err) {
            res.redirect('/plants');
        } else {
            res.send(err);
        }
    })
})

// Create '/<nameOfResource>/' POST 
app.post('/plants', (req, res) => {
    Plant.create(req.body, (err, createdPlant) => {
        if(!err) {
            res.redirect('/plants');
        } else {
            res.send(err);
        }
    })
});

// Edit '/<nameOfResource>/:id/edit' GET
app.get('/plants/:id/edit', (req, res) => {
    Plant.findById(req.params.id, (err, foundPlant) => {
        if(!err) {
            res.render('Edit', {
                plant: foundPlant,
                mongoIndex: req.params.id
            })
        } else {
            res.send(err);
        }
    })});

// Show '/<nameOfResource>/:id' GET 
app.get('/plants/:id', (req, res) => {
    Plant.findById(req.params.id, (err, foundPlant) => {
        if(!err) {
            res.render('Show', {
                plant: foundPlant
            })
        } else {
            res.send(err);
        }
    })
});

// ======================================================================================
//                                  LISTENER
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

app.listen(PORT, () => console.log( 'Listening on port:', PORT));