const express = require('express');
 const morgan = require('morgan');
const app = express();


let topMovies = [
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

// Error-handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err.stack);
	res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
