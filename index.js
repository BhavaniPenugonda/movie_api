const express = require('express');
 const morgan = require('morgan');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());

const { check, validationResult } = require('express-validator');

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

/*mongoose.connect('mongodb://127.0.0.1:27017/myFlixmDB', { useNewUrlParser: true, useUnifiedTopology: true }) */
  mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });




// Serve static files from the "public" directory
app.use(express.static('public'));

// Morgan middleware to log all requests to the terminal
app.use(morgan('common'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movies club!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __movie_api });
});

// Get all movies
app.get('/movies',  (req, res) => {
 Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
          
// GET data of movie  by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),(req,res)=>{
   Movies.findOne({ 
     
   Title: {$regex:req.params.title,$options:'i'}
   })// Case-insensitive regex search
        .then((movie) => {
            if (movie) {
                res.json(movie);
            } else {
                res.status(404).send(
                    'Movie with the title ' +
                        req.params.title +
                        ' was not found.'
                );
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Return Genre description
app.get('/genres/:Name',passport.authenticate('jwt', { session: false }),(req,res)=>{
 Movies.findOne({ 'Genre.Name':{$regex: req.params.Name,$options:'i'}
   })
        .then((genre) => {
            if (genre) {
                res.json(genre.Genre);
            } else {
                res.status(404).send(
                    'Genre with the name ' + req.params.Name + ' was not found.'
                );
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//Return data about a director (bio, birth year, death year) by name
app.get('/directors/:Name',passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name':{$regex: req.params.Name , $options:'i'}
  })
      .then((director) => {
          if (director) {
              res.json(director.Director);
          } else {
              res.status(404).send(
                  'Director with the name ' +
                      req.params.Name +
                      ' was not found.'
              );
          }
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }),(req, res) => {
Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//Get user details by username
app.get('/users/:username',passport.authenticate('jwt', { session: false }),(req,res)=>{
  Users.findOne({ Username: {$regex:req.params.username,$options:'i'}
   })
        .then((user) => {
            if (user) {
                res.json(user);
            } else {
                res.status(404).send(
                    'User details with username ' +
                        req.params.username +
                        ' was not found.'
                );
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Allow new users to register
app.post('/users',
  
//minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  let hashedPassword = Users.hashPassword(req.body.Password);
Users.findOne({ Username: req.body.Username
   })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


//Allow users to update their user info (username)
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),(req, res) => {
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
}
   Users.findOneAndUpdate({ Username: req.params.Username
   }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });

});

//Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username
   }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) 
  .then((updatedUser) => {
   
    res.json(updatedUser);
    
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:movieID',passport.authenticate('jwt', { session: false }),(req, res) => {
Users.findOneAndUpdate(
      {
          Username: req.params.Username,
          FavoriteMovies: req.params.movieID,
          
      },
      {
          $pull: { FavoriteMovies: req.params.movieID },
      },
      { new: true }
  )
      .then((updatedUser) => {
          res.json(updatedUser);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

//Allow existing users to deregister using name
app.delete('/users/:username',passport.authenticate('jwt', { session: false }), (req, res) => {
  
Users.findOneAndDelete({Username : req.params.username
   })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Error-handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err.stack);
	res.status(500).send('Something broke!');
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
