# Todo List Application

A simple task management application built with Node.js and MongoDB.

## Features
- User registration and authentication
- Task management: Add, edit, and delete tasks
- Session handling via cookies

## Tech Stack
- **Backend**: Node.js (HTTP module)
- **Database**: MongoDB
- **Authentication**: bcrypt for password hashing
- **Frontend**: HTML/CSS (served as static files)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/todo-list-nodejs.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   DB_URI=your_mongo_uri
   PORT=3000
   ```
4. Start the server:
   ```bash
   node server.js
   ```

## API Endpoints

| Method | Endpoint        | Description                 |
|--------|-----------------|-----------------------------|
| POST   | /register       | Register a new user         |
| POST   | /login          | Log in an existing user     |
| GET    | /todo           | Retrieve the list of tasks  |
| POST   | /todo           | Add a new task              |
| PUT    | /todo           | Edit an existing task       |
| DELETE | /todo           | Delete an existing task     |

## Known Issues
- The application lacks advanced session management.

## Contributing
Contributions are welcome! Feel free to create a pull request.
```