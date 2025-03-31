const passport=require('passport');
const LocalStrategy = require('passport-local').Strategy,
Models=require('./models.js')
passportJWT =require('passport-jwt');


let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT= passportJWT.ExtractJwt;


/**
 * Local Authentication Strategy
 * This strategy is used to authenticate a user using the 'Username' and 'Password' fields.
 *
 * @param {string} username - The username of the user attempting to authenticate.
 * @param {string} password - The password provided by the user for authentication.
 * @param {function} callback - The callback function that provides the result of the authentication process.
 * 
 * @returns {void} Calls the callback with the user object if authentication is successful or error message if not.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField:'Username',
      passwordField:'Password'
      
    },
    async(username,password,callback) =>
    {
      console.log(`${username} ${password}`);
      await Users.findOne({Username:username})
      .then((user)=>{
        if(!user) {
          console.log('incorrect username');
          return callback(null,false,{
            message:'Incorrect username or password. ',
          });
        }
        if (!user.validatePassword(password)) {
          console.log('incorrect password');
          return callback(null, false, { message: 'Incorrect password.' });
        }
      console.log('finished');
       return callback(null,user);
       })
       .catch((error)=>{
        if(error){
          console.log(error);
          return callback(error);
        }
       })
    }
  )
);

/**
 * JWT Authentication Strategy
 * This strategy is used to authenticate a user by verifying the JWT passed in the Authorization header.
 *
 * @param {Object} jwtPayload - The payload of the decoded JWT.
 * @param {function} callback - The callback function that provides the result of the authentication process.
 *
 * @returns {void} Calls the callback with the user object if JWT is valid or an error message if not.
 */
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
  return await Users.findById(jwtPayload._id)
    .then((user) => {
      return callback(null, user);
    })
    .catch((error) => {
      return callback(error)
    });
}));
