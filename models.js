
const mongoose= require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Movie Schema representing a movie's information in the database.
 *
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {string} Description - A short description or plot of the movie.
 * @property {Object} Genre - Genre details for the movie.
 * @property {string} Genre.Name - The name of the movie genre.
 * @property {string} Genre.Description - A description of the genre.
 * @property {Object} Director - Director details of the movie.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - A biography of the director.
 * @property {string} ImagePath - The file path of the movie's image or poster.
 * @property {boolean} Featured - A flag indicating whether the movie is featured or not.
 */
let movieSchema = mongoose.Schema({
   Title:{type:String, required :true},
   Description: { type : String,required :true},
   Genre:{
    Name : String,
    Description : String
   },
   Director:{
    Name : String,
    Bio: String
   },
   ImagePath: String,
   Featured: Boolean
  });

  /**
 * User Schema representing a user in the database.
 *
 * @typedef {Object} User
 * @property {string} Username - The username of the user.
 * @property {string} Password - The hashed password of the user.
 * @property {string} Email - The email address of the user.
 * @property {Date} Birthday - The birth date of the user.
 * @property {ObjectId[]} FavoriteMovies - An array of ObjectId references to the user's favorite movies.
 */
  let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Static method for hashing a password.
 *
 * @param {string} password - The plain text password to hash.
 * @returns {string} The hashed password.
 * 
 * @description
 * This method uses bcrypt to hash the password with a salt rounds of 10.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Instance method for validating a password.
 *
 * @param {string} password - The plain text password to validate.
 * @returns {boolean} Whether the password matches the hashed password stored in the database.
 * 
 * @description
 * This method compares the provided password with the hashed password in the database using bcrypt.
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

// Movie Model based on movieSchema
const Movie = mongoose.model('Movie',movieSchema);
// User Model based on userSchema
const User = mongoose.model('User',userSchema);

module.exports.Movie = Movie;
module.exports.User = User;