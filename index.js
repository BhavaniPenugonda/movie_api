/**
 * @fileoverview myFlix API routes for managing users and movies in the system.
 * This file contains endpoints to get, create, update, and delete users and movies.
 */
const { S3Client,ListObjectsV2Command,GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const stream = require('stream');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();



// AWS S3 Client setup

const s3Client = new S3Client({
  endpoint: 'http://localhost:4566', // LocalStack endpoint 
  region: 'eu-central-1',
  credentials: {
    accessKeyId: 'Bhavani@2294',
    secretAccessKey: 'Bhavani', 
  },
  forcePathStyle: true, // Set this for LocalStack to work properly with path-style URLs
});


require('dotenv').config();
const express = require('express');
 const morgan = require('morgan');
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = [ 'http://localhost:4200','http://localhost:1234','http://localhost:4566', 'https://bhavani-flixmovies.netlify.app/','https://bhavanipenugonda.github.io','http://bhavani-myflixclient.s3-website.eu-central-1.amazonaws.com','http://3.124.12.171'];
//app.use(cors());



app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

const { check, validationResult } = require('express-validator');

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');

// Models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB database
/*mongoose.connect('mongodb://127.0.0.1:27017/myFlixmDB', { useNewUrlParser: true, useUnifiedTopology: true }) */
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Successfully connected to the database');
})
.catch((error) => {
  console.error('Error connecting to the database: ', error);
});




// Serve static files from the "public" directory
app.use(express.static('public'));

// Morgan middleware to log all requests to the terminal
app.use(morgan('common'));
app.use(fileUpload());
// GET requests
/**
 * GET endpoint for the homepage.
 * @route GET /
 * @returns {string} Welcome message.
 */
app.get('/', (req, res) => {
  res.send('Welcome to my movies club!');
});

/**
 * GET endpoint for the documentation page.
 * @route GET /documentation
 * @returns {void} Returns the documentation HTML page.
 */
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __movie_api });
});

// Get all movies
/**
 * GET endpoint to fetch all movies.
 * @route GET /movies
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Array} A list of movie objects.
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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
/**
 * GET endpoint to fetch a genre by name.
 * @route GET /genres/:Name
 * @param {string} Name - The genre name to retrieve.
 * @returns {object} The genre object if found, or an error message.
 */
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
/**
 * POST endpoint to allow new users to register.
 * @route POST /users
 * @param {string} Username - The username of the new user.
 * @param {string} Password - The password for the new user.
 * @param {string} Email - The email of the new user.
 * @param {string} Birthday - The birthday of the new user.
 * @returns {object} The newly created user object or error message.
 * @example
 * // Example request body:
 * {
 *   "Username": "john_doe",
 *   "Password": "password123",
 *   "Email": "john@example.com",
 *   "Birthday": "1990-01-01"
 * }
 */
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
    console.log(errors);

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
            Password: hashedPassword,
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
let hashedPassword = Users.hashPassword(req.body.Password);
   Users.findOneAndUpdate({ Username: req.params.Username
   }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
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

//Endpoint to Fetch User Favorite Movies 
app.get('/users/:Username/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Find the user by their username (you can change this to find by userId if needed)
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Return the user's favorite movies
      res.json(user.FavoriteMovies);
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
/**
 * DELETE endpoint to deregister a user by their username.
 * @route DELETE /users/:username
 * @param {string} username - The username of the user to deregister.
 * @returns {string} A success message or an error message.
 */
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

// Endpoint to list all objects in the bucket
app.get('/list', async (req, res) => {

  const listObjectsParams = {
  Bucket: process.env.BUCKET_NAME,  // Your bucket name
  };

  const listObjectsCmd = new ListObjectsV2Command(listObjectsParams);

    try {
    const data = await s3Client.send(listObjectsCmd);
    // Send the list of objects as a response
    res.status(200).json(data.Contents);
    }
    catch (error) {
    console.error('Error listing objects:', error);
    // Send error response
    res.status(500).send('Failed to list objects');
    }
});



// Endpoint to upload a file to the bucket
app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).send('No file uploaded.');
  }

  const file = req.files.image; // The file uploaded from the form
  const fileName = file.name; // Extract the filename
  const bucketName = process.env.BUCKET_NAME; // Your S3 bucket name

  // Create the parameters for uploading the file to S3
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.data // The file content as the body
  };

  // Create the PutObjectCommand
  const uploadCommand = new PutObjectCommand(uploadParams);

  try {
    // Upload the file to the S3 bucket
    await s3Client.send(uploadCommand);
    res.status(200).send(`File uploaded successfully: ${fileName}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Failed to upload file');
  }
});



// Endpoint to retrieve an object from the bucket
app.get('/download/:fileName', async (req, res) => {
  const fileName = req.params.fileName; // Get file name from URL parameter
  const bucketName = process.env.BUCKET_NAME; // Your S3 bucket name

  // If it's a resized image, the key in S3 should start with "resized/"
  let fileKey = fileName;

  // If the image is resized, the key will have the "resized/" prefix
  if (!fileName.startsWith('resized/')) {
    fileKey = 'resized/' + fileName; // Add the "resized/" prefix
  }
  // Create the parameters for retrieving the file from S3
  const getObjectParams = {
    Bucket: bucketName,
    Key: fileKey
  };

  // Log the key being requested for debugging
  console.log(`Fetching file from S3 with key: ${fileKey}`);


  // Create the GetObjectCommand
  const getObjectCommand = new GetObjectCommand(getObjectParams);

  try {
    // Get the object from the S3 bucket
    const data = await s3Client.send(getObjectCommand);

    
    // Set the appropriate content type based on the file extension
    res.setHeader('Content-Type', data.ContentType);

    // Pipe the file to the response
    data.Body.pipe(res);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).send('Failed to retrieve file');
  }
});



/*
exports.handler = async (event) => {
    try {
        // Extract the S3 bucket and key from the event
        //const { bucket, key } = event;
        const bucket = event.Records[0].s3.bucket.name;  // Get bucket name from the event
        const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));  // Get key (path) from the event and decode it
        console.log(`Bucket: ${bucket}`);
        console.log(`Key: ${key}`);



        // Get the image from S3
        const s3Object = await s3.getObject({ Bucket: bucket, Key: key }).promise();
        const imageBuffer = s3Object.Body;

        // Resize the image to 200x200
        const resizedImageBuffer = await sharp(imageBuffer)
            .resize(200, 200)
            .toBuffer();

        // Upload the resized image back to S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: `resized/${key}`, // The resized image will be stored in a 'resized' folder
            Body: resizedImageBuffer,
            ContentType: 'image/jpeg',
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Image resized successfully',
                uploadedTo: uploadResult.Location,
            }),
        };
    } catch (error) {
        console.error('Error resizing image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error resizing the image' }),
        };
    }
};

*/

// Error-handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err.stack);
	res.status(500).send('Something broke!');
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port); 
});

