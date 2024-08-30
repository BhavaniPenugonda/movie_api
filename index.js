const express = require('express');
const app = express();

let topmovies = [
{
  title: 'The Dark Knight',
  director: 'Christopher Nolan'
},
{
  title:'The shawshank Redemption',
  director: 'Frank Darabont'
},
{
title: 'Avatar',
director: 'James Cameron'
},
{
  title :'The Departed',
  director: 'Martin Scorsese'
},
{
  title : 'Leave the World Behind ',
  director: 'Sam Esmail'
},
{
  title: 'Catch Me If You Can',
  director: 'Steven Spielberg'
},
{
  title: 'The Godfather',
  Director : 'Francis Ford coppola'
},
{
  title : 'Titanic',
  director: 'James Cameron'
},
{
  title: 'The Matrix',
  director: 'Wachowskis'
},
{
  title: 'Forrest Gump',
  director: 'Robert Zemeckis'
}
];

//GET requests
app.get('/',(req,res)=>{
  res.send('Welcome to my movie club!');
});
app.get('/movies', (req, res) => {
  res.json(topmovies);
});
// listen for requests
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});