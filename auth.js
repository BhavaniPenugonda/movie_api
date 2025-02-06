const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file

/**
 * Generates a JWT token for the user.
 * 
 * @param {Object} user - The user object to be included in the JWT payload.
 * @returns {string} The generated JWT token.
 * 
 * @description
 * This function takes the user object, signs it with a secret key, and generates a JWT token.
 * The token is valid for 7 days, and it uses the 'HS256' algorithm to sign the token.
 * The subject of the token is set to the user's username.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}


/**
 * POST /login route for authenticating users.
 * 
 * @param {Object} router - The Express router object.
 * 
 * @returns {void} This function will handle the POST request for the login route.
 * 
 * @description
 * This route uses Passport's local strategy to authenticate users. If the authentication is successful, a JWT token is generated for the user and returned in the response.
 * If authentication fails, an error message is sent with status code 400.
 */

module.exports = (router) => {
  /**
   * POST /login
   * @param {Express.Request} req - The request object.
   * @param {Express.Response} res - The response object.
   * 
   * @returns {void} The function sends back a response with either the JWT token and user information, or an error message.
   * 
   * @description
   * This route handler authenticates the user via Passport's 'local' strategy.
   * If successful, it creates a JWT token and returns it along with user details.
   * If unsuccessful, it returns an error message.
   */
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}