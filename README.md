# Authentication API

This is a backend API for user authentication built with Node.js, Express, and MongoDB. It provides secure user registration and login functionality.

## Features

* **Secure Registration:** User registration with input validation, password hashing using bcrypt, and prevention of duplicate email addresses.
* **JWT Authentication:**  User login with secure JWT (JSON Web Token) authentication.
* **Protected Routes:**  Includes an example of a protected route (`/api/auth-endpoint`) that requires a valid JWT for access.
* **CORS Enabled:** Cross-Origin Resource Sharing (CORS) is enabled to allow requests from different origins.
* **Comprehensive Error Handling:**  `try...catch` blocks are used throughout to handle potential errors.

## Technologies Used

* node.js
* express.js
* mongoDB
* bcrypt
* jsonwebtoken
* dotenv
* jest
* supertest

## Getting started

* Install dependencies
``` npm install ```
* Set up environment variables:\
Create a `.env` file in the root directory and add `PORT`, `DB_URL` and `JWT_SECRET`
* Create database `authDB` with collection `users`
* Start the server:
`npm start`

## API Endpoints
* `/api/signup` (POST): Register a new user. Requires `firstName`, `lastName`, `email`, and `password` in the request body.
* `/api/login` (POST): Log in an existing user. Requires `email` and `password` in the request body.
* `/api/free-endpoint` (GET): A public endpoint accessible without authentication.
* `/api/auth-endpoint` (GET): A protected endpoint that requires a valid JWT in the Authorization header.

### This is a work in progress. The `/api/signup` (GET) route currently returns the contents of the user database, and would be replaced with a login page.