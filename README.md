# Authentication API

This is a backend API for user authentication built with Node.js, Express, and MongoDB. It provides secure user registration and login functionality.

## Features

* User registration with validation and password hashing.
* User login with JWT (JSON Web Token) authentication.
* Secure password storage using bcrypt.
* Input validation to ensure data integrity.
* Error handling with informative error messages.

## Technologies Used

* Node.js
* Express.js
* MongoDB
* bcrypt
* jsonwebtoken

## Getting started

* Install dependencies
``` npm install ```
* Set up environment variables:\
Create a `.env` file in the root directory and add `DB_URL` and `JWT_SECRET`
* Create database `authDB` with collection `users`
* Start the server:
`npm start`

## API Endpoints
* `/api/signup` (POST): Register a new user.
* `/api/login` (POST): Log in an existing user.

### This is a work in progress. The `/api/signup` (GET) route currently returns the contents of the the user database, and would be replaced with a login page.