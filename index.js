const express = require('express');
 const morgan = require('morgan');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;



const topMovies = [
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan'
  },
  {
    title: 'The Shawshank Redemption',
    director: 'Frank Darabont'
  },
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppola'
  },
  {
    title: 'Titanic',
    director: 'James Cameron'
  },
  {
    title: 'Forrest Gump',
    director: 'Robert Zemeckis'
  },
  {
    title: 'The Matrix',
    director: 'Wachowskis'
  },
  {
    title: 'Avatar',
    director: 'James Cameron'
  },
  {
    title: 'The Departed',
    director: 'Martin Scorsese'
  },
  {
    title: 'Catch Me If You Can',
    director: 'Steven Spielberg'
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino'
  }

];

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

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// GET movies by name
app.get('/movies/:title', (req,res)=>{
  res.send('Successful GET request returning data of single movie');
 });

// Return Genre description
app.get('/genre/:title',(req,res)=>{
  res.send('Successful GET request returning data on a genre.');
});

//Return data about a director (bio, birth year, death year) by name
app.get('/directors/:name', (req, res) => {
  res.send('Successful GET request returning director data on name.');
});

//Allow new users to register
app.post('/users', (req, res) => {
  res.send('Successful POST request to register a new user.');
});

//Allow users to update their user info (username)
app.put('/users/:username', (req, res) => {
  res.send('Successful PUT request to update a users username.');
});

//Allow users to add a movie to their list of favorites
app.post('/users/:username/favorites', (req, res) => {
  res.send('Successful POST request to add a movie to a users list of favorites.');
});

//Allow users to remove a movie from their list of favorites
app.delete('/users/:username/favorites/:movieTitle', (req, res) => {
  res.send('Successful DELETE request to remove a movie of a users list of favorites.');
});

//Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
  res.send('Successful DELETE request to deregister an existing user.');
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
