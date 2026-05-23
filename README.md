# 🎓 Mahila ITI Surendranagar — Student Management Backend API

A RESTful backend API built with **Node.js**, **Express**, and **MongoDB** for managing students of Mahila ITI Surendranagar. It supports student registration, JWT-based authentication, role-based access (Admin/Student), and profile management.

🌐 **Live API:** [https://iti-student-management-backend.onrender.com](https://iti-student-management-backend.onrender.com)

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [MVC Architecture](#-mvc-architecture)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Role-Based Access](#-role-based-access)
- [Error Handling](#-error-handling)

---

## ✅ Features

- Student Registration with Trade selection
- Admin & Student role system
- JWT-based Authentication (Bearer Token)
- Password hashing with bcrypt
- Get own profile (protected)
- Update password (protected)
- Admin can view all students
- Centralized error handling

---

## 🛠 Tech Stack

| Technology | Purpose                         |
|------------|---------------------------------|
| Node.js    | JavaScript runtime              |
| Express.js | Web framework                   |
| MongoDB    | NoSQL Database                  |
| Mongoose   | MongoDB ODM                     |
| JWT        | Authentication tokens           |
| bcrypt     | Password hashing                |
| dotenv     | Environment variable management |
| cors       | Cross-Origin Resource Sharing   |
| nodemon    | Development auto-restart        |

---

## 🏗 MVC Architecture

This project follows the **MVC (Model-View-Controller)** design pattern — a standard way to organize backend code so it stays clean, readable, and easy to maintain.

> Since this is a pure backend/API project, there is no **View** layer. Instead, JSON responses are sent directly to the client (frontend/Postman).

### How MVC works in this project:

```
Request from Client (Postman / Frontend)
         │
         ▼
    [ Routes ]         → userRoutes.js
    Decides which         Matches the URL and HTTP method,
    controller to call    calls the right controller function
         │
         ▼
  [ Controller ]       → userController.js
  Handles the logic       Reads req.body, calls Model,
                          sends back res.json(...)
         │
         ▼
    [ Model ]          → User.js
    Talks to Database     Mongoose Schema — defines shape
                          of data, saves/fetches from MongoDB
         │
         ▼
      MongoDB
```

### Layer breakdown in this project:

| MVC Layer  | Folder / File               | What it does                                      |
|------------|-----------------------------|---------------------------------------------------|
| **Model**  | `models/User.js`            | Defines User schema, password hashing, comparePassword method |
| **View**   | *(Not applicable)*          | API returns JSON — no HTML/template engine used   |
| **Controller** | `controllers/userController.js` | register, login, getprofile, updatePassword, getalluser logic |
| **Routes** | `routes/userRoutes.js`      | Maps URL endpoints to controller functions        |
| **Middleware** | `middleware/`           | Auth check, Admin check, Error handling (runs between Route and Controller) |
| **Config** | `config/db.js`              | MongoDB connection setup                          |

### Real example — Login flow:

```
POST /user/login
      │
      ▼
userRoutes.js       → router.post('/login', userController.login)
      │
      ▼
authMiddleware.js   → (skipped — login is a public route)
      │
      ▼
userController.js   → login()
                       1. Read email & password from req.body
                       2. Find user in DB using User.findOne()
                       3. Compare password using user.comparePassword()
                       4. Generate JWT token
                       5. Send token in response
      │
      ▼
User.js (Model)     → User.findOne({email}) hits MongoDB
      │
      ▼
Client gets:  { success: true, token: "eyJ..." }
```

---

## 📁 Project Structure

```
backend/
│
├── app.js                  # Express app setup, middleware, routes
├── server.js               # Server entry point (starts app)
│
├── config/
│   └── db.js               # MongoDB connection
│
├── models/
│   └── User.js             # User schema (Student/Admin)
│
├── controllers/
│   └── userController.js   # Business logic for all routes
│
├── routes/
│   └── userRoutes.js       # API route definitions
│
├── middleware/
│   ├── authMiddleware.js   # JWT verify + token generator
│   ├── adminMiddleware.js  # Admin role check
│   └── errorMiddleware.js  # Global error handler
│
├── .env                    # ⚠️ Not pushed to GitHub (add to .gitignore)
├── .gitignore
└── package.json
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` root folder and add these variables:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

> ⚠️ Never push your `.env` file to GitHub. It is already listed in `.gitignore`.

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
Manually create a `.env` file in the `backend/` folder and fill in the values shown in the [Environment Variables](#-environment-variables) section above.

### 4. Run the server

**Development mode (auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server runs on: `http://localhost:3000`

---

## 📡 API Endpoints

### Base URL
```
https://iti-student-management-backend.onrender.com
```

### Health Check
```
GET /
```
**Response:**
```json
{
  "success": true,
  "message": "ITI Backend API Running 🚀"
}
```

---

### 👤 User Routes — `/user`

#### 1. Register a new user
```
POST /user/register
```
**Request Body:**
```json
{
  "fullName": "Rina Patel",
  "email": "rina@example.com",
  "password": "rina1234",
  "trade": "COPA",
  "enrollmentNo": "ITI2024001",
  "role": "student"
}
```

**Available Trades:**
- `COPA`
- `Sewing Technology`
- `Hair & Skin Care`
- `Dress Making`
- `Embroidery & Needle Work`
- `Stenography`
- `Food Production`

**Success Response (201):**
```json
{
  "success": true,
  "newuser": { "..." },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

#### 2. Login
```
POST /user/login
```
**Request Body:**
```json
{
  "email": "rina@example.com",
  "password": "rina1234"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

#### 3. Get My Profile 🔒
```
GET /user/getprofile
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "fullName": "Rina Patel",
    "email": "rina@example.com",
    "trade": "COPA",
    "role": "student"
  }
}
```

---

#### 4. Update Password 🔒
```
PUT /user/updatePassword
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Request Body:**
```json
{
  "currentPassword": "rina1234",
  "newPassword": "newpass456"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

#### 5. Get All Students 🔒 (Admin Only)
```
GET /user/getalluser
```
**Headers:**
```
Authorization: Bearer <admin_token>
```
**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "user": [
    {
      "fullName": "Rina Patel",
      "email": "rina@example.com",
      "trade": "COPA",
      "enrollmentNo": "ITI2024001"
    }
  ]
}
```

---

## 🔑 Authentication Flow

```
Client → POST /user/login → Server verifies email + password
       → Generates JWT Token (valid 100 hours)
       → Client stores token
       → Client sends token in every protected request header
       → authMiddleware verifies token → allows or rejects
```

**How to send the token in requests:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡 Role-Based Access

| Route               | Student | Admin |
|---------------------|---------|-------|
| POST /register      | ✅      | ✅    |
| POST /login         | ✅      | ✅    |
| GET /getprofile     | ✅      | ✅    |
| PUT /updatePassword | ✅      | ✅    |
| GET /getalluser     | ❌      | ✅    |

> Only **one admin** can exist in the system. Registering a second admin returns a 400 error.

---

## ⚠️ Error Handling

All errors go through the global `errorMiddleware`. Every error response follows this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common HTTP Error Codes:**

| Code | Meaning                              |
|------|--------------------------------------|
| 400  | Bad Request (validation failed)      |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (not an admin)             |
| 404  | Resource not found                   |
| 500  | Internal Server Error                |

---

## 📦 NPM Scripts

| Command       | Description                   |
|---------------|-------------------------------|
| `npm start`   | Start server (production)     |
| `npm run dev` | Start server with nodemon     |

---

## 👨‍💻 Developer Notes

- Passwords are **never stored in plain text** — bcrypt hashes them before saving (salt rounds: 10).
- JWT tokens expire in **100 hours** — after that the user must login again.
- `enrollmentNo` is **optional but unique** — uses `sparse: true` in Mongoose schema so multiple users can skip it without conflict.
- CORS is enabled globally — any frontend origin can call this API.

---

## 👨‍💻 Author

**Sunil Memakiya**

[GitHub](https://github.com/memakiysunil)

---

## 📄 License

This project is built for educational purposes as part of the ITI Student Management System.

---

*Made with ❤️ for Mahila ITI Surendranagar*
