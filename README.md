# 🚀 **Nexus-Social Backend API Task**  

Welcome to the **Genuin Platform API** — a scalable backend service that allows users to interact with **brands**, **communities**, **groups**, and **videos** seamlessly. The platform supports **role-based access control (RBAC)**, **JWT authentication**, **Cloudinary integration** for media uploads, **Redis caching**, and is **Dockerized** for smooth deployment.  

---

## 🎯 **Table of Contents**  
- [⚡ Project Features](#-project-features)  
- [🛠️ Tech Stack](#-tech-stack)  
- [📂 Project Structure](#-project-structure)  
- [⚙️ Setup Instructions](#-setup-instructions)  
- [🔒 Authentication](#-authentication)  
- [📝 Documentation (Swagger)](#-documentation-swagger)   
---

## ⚡ **Project Features**  
✨ **JWT-based authentication** with secure token management  
🔐 **Role-Based Access Control (RBAC)** — Admins can manage communities, while users have restricted access  
🎬 **Video Upload** via **Cloudinary** with support for community, brand, and group-specific uploads  
📚 **CRUD APIs** for Brands, Communities, Groups, and Videos  
🔥 **Redis caching** for recent videos, top brands, and recent groups  
📜 **Pagination & Rate Limiting** for optimized performance    
📑 **Swagger API documentation** for seamless integration  

---
## 🔒 **Authentication**

### 🔑 **JWT-based Authentication**
- The application uses **JWT (JSON Web Tokens)** for secure authentication.  
- After successful login or registration, a **JWT token** is generated and returned to the user.  
- The token must be included in the **Authorization header** as a **Bearer token** for accessing protected routes.

#### 📝 **Example of Authorization Header:**
---'
## 🛠️ **Tech Stack**  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL (Sequelize ORM)  
- **Authentication:** JWT, Passport.js  
- **File Storage:** Cloudinary  
- **Caching:** Redis  
- **Containerization:** Docker, Docker Compose  
- **Testing:** Postman  
- **Documentation:** Swagger (OpenAPI 3.0)  

---

## 📂 **Project Structure**
```plaintext
│
├── config/                # Configuration files (DB, Cloudinary, Passport)
│   ├── database.js
│   ├── cloudinary.js
│   ├── redis.js
│   └── passport.js
│
├── models/                # Sequelize models
│   ├── Userdb.js
│   ├── Brand.js
│   ├── Community.js
│   ├── Groups.js
│   ├── Video.js
│   └── GroupMember.js
│
├── routes/                # API route handlers
│   ├── auth.js
│   ├── brand.js
│   ├── community.js
│   ├── group.js
│   └── video.js
│
├── middlewares/           # Custom middleware (Auth, Upload)
│   ├── auth.js
│   └── upload.js
│
├── utils/                 # Utility functions (JWT generation)
│   └── jwt.js
│
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose file
├── swagger.json           # Swagger API documentation
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── index.js               # Entry point

---

