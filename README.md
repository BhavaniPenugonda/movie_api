
**Movies Web Application API**

This is the server-side component of the Movies Web Application, built with Node.js, Express, and MongoDB. The API allows users to access information about movies, directors, and genres. Users can also create an account, manage their profile, and manage their list of favorite movies.


**Features**
Movies:

View a list of all movies.
Get detailed information on a specific movie (by title).
Get information about a genre (by name).
Get information about a director (by name).

User Management:

User registration (create a new profile).
Update user information (username, password, email, date of birth).
Add/remove movies to/from the favorite list.
Deregister (delete a user account).
Authentication & Authorization:

User authentication using JWT (JSON Web Tokens) for secure access.

**Technology Stack**

Node.js: Backend JavaScript runtime
Express: Web framework for Node.js
MongoDB: Database to store movie and user data
Mongoose: ODM for MongoDB to interact with the database
JWT: User authentication
Body-parser: Middleware to parse incoming request bodies
Morgan: Middleware for logging HTTP requests
Bcrypt: Hashing passwords for security

**Prerequisites**
Before running the API, make sure you have:

Node.js installed (preferably version 14.x or above)
MongoDB (either a local installation or a cloud-based instance)
Postman to test the API 


**Installation**

Clone this repository:

git clone https://github.com/bhavanipenugonda/movie_api.git

Navigate into the project directory:
cd movie_api

Install dependencies:

npm install

Deployed link: https://flixmovies-1ddcfb2fa4c5.herokuapp.com/