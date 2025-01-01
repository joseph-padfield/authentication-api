# Node.js Authentication API

This project implements a RESTful API for user authentication using Node.js, Express, and MongoDB. It provides secure registration and login functionality with JSON Web Tokens (JWTs) for authorisation.

## Features

- User registration with email and password validation.
- Secure password hashing using bcrypt.
- User login with email and password.
- JWT-based authentication for protected routes.
- Comprehensive test suite with Jest for high test coverage.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- bcrypt
- jsonwebtoken (JWT)
- Jest

## Getting Started

1.  **Clone the repository:**
    ```
    git clone git@github.com:joseph-padfield/authentication-api.git
    ```

2.  **Install dependencies:**
    ```
    cd auth-backend
    npm install
    ```

3.  **Configure environment variables:**
    - Create a `.env` file in the root directory.
    - Add the following environment variables:
      ```
      DB_URL=<your_mongodb_connection_string>
      JWT_SECRET=<your_jwt_secret_key>
      ```

4.  **Start the server:**
    ```
    npm start
    ```

## API Endpoints

- **POST /api/signup:** Register a new user.
    - Request body:
      ```json
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "password": "SecurePassword123"
      }
      ```
    - Successful response (201 Created):
      ```json
      {
        "message": "User registered successfully",
        "userId": "newly_created_user_id"
      }
      ```

- **POST /api/login:** Login an existing user.
    - Request body:
      ```json
      {
        "email": "john.doe@example.com",
        "password": "SecurePassword123"
      }
      ```
    - Successful response (200 OK):
      ```json
      {
        "message": "User logged in successfully",
        "email": "john.doe@example.com",
        "token": "generated_jwt_token" 
      }
      ```

- **GET /api/free-endpoint:** Public endpoint (no authentication required).
    - Successful response (200 OK):
      ```json
      {
        "message": "This is a freely accessible endpoint."
      }
      ```

- **GET /api/auth-endpoint:** Protected endpoint (requires authentication).
    - Requires a valid JWT in the `Authorization` header (`Bearer your_jwt_token`).
    - Successful response (200 OK):
      ```json
      {
        "message": "This is a secure endpoint. If you can read this, it means that you are authorised."
      }
      ```

## Testing

- Run the tests using:
  ```
  npm test
  ```
