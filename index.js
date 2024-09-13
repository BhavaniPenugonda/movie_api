const express = require('express');
 const morgan = require('morgan');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixmDB', { useNewUrlParser: true, useUnifiedTopology: true })
  

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
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
          
// GET data of movie  by title
app.get('/movies/:Title', async(req,res)=>{
  await Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            if (movie) {
                res.json(movie);
            } else {
                res.status(404).send(
                    'Movie with the title ' +
                        req.params.Title +
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
app.get('/genres/:Name',async(req,res)=>{
  await Movies.findOne({ 'Genre.Name': req.params.Name })
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
app.get('/directors/:Name', async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.Name })
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
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Allow new users to register
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
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
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
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
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
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
app.delete('/users/:Username/favorites/:movieID', async (req, res) => {
  await Users.findOneAndUpdate(
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
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
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
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
