# Gallery API

A full-featured photo gallery API built with Node.js and Express that allows users to manage their image galleries with user authentication, avatar uploads, and gallery image management.

## 📋 System Overview

Gallery API is a REST API that enables users to:
- **Create accounts** and authenticate securely with JWT tokens
- **Upload and manage** profile avatars
- **Create and manage** photo galleries with captions
- **Search** through gallery images with pagination support
- **Update** and **delete** images and avatars

The system uses a MySQL database to store user accounts and gallery metadata, while image files are stored on disk.

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 2
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: Bcrypt
- **File Upload**: Multer
- **Environment Config**: Dotenv
- **CORS**: Enabled for cross-origin requests

### Project Structure

```
Gallery-api/
├── app.js                 # Main application entry point
├── package.json          # Dependencies & scripts
├── .env                  # Environment variables
├── Routes/               # Express route handlers
│   ├── auth.js          # Authentication routes (signup, login)
│   ├── media.js         # Avatar management routes
│   └── gallery.js       # Gallery management routes
├── Controllers/          # Business logic
│   ├── auth.js          # Auth logic (signup, login)
│   ├── media.js         # Avatar upload & profile logic
│   └── gallery.js       # Gallery CRUD operations
├── Middlewares/         # Custom middleware
│   └── middleware.js    # JWT token verification
├── Model/               # Database
│   └── db.js           # MySQL connection pool
├── uploads/             # Uploaded files storage
│   ├── avatars/        # User profile pictures
│   └── gallery/        # Gallery images
└── Public/              # Static files
    └── login.html      # Login page
```

## 🔄 How the System Works

### 1. **Authentication Flow**

```
User Signup/Login
    ↓
POST /api/signup or /api/login
    ↓
Controllers/auth.js validates credentials
    ↓
Password hashed with Bcrypt
    ↓
JWT token generated (7-day expiry)
    ↓
Token sent to client
```

**Signup** (`POST /api/signup`):
- Accepts: `username`, `email`, `password`
- Checks for duplicate username/email
- Hashes password with bcrypt
- Creates user record in database
- Returns: `userId`

**Login** (`POST /api/login`):
- Accepts: `email`, `password`
- Verifies credentials against stored data
- Generates JWT token valid for 7 days
- Returns: `token`, user data (`id`, `username`, `email`)

### 2. **Token Verification Middleware**

Every protected route uses `verifyToken` middleware:
```
Client Request with Authorization Header
    ↓
Extract Bearer token from "Authorization: Bearer <token>"
    ↓
Verify JWT signature using JWT_SECRET_KEY
    ↓
Decode token to extract userId
    ↓
Attach userId to request object
    ↓
Proceed to next middleware/controller
```

### 3. **Avatar Management**

**Upload Avatar** (`POST /api/upload/avatar`):
- Requires: JWT token in Authorization header
- Accepts: Single image file (`avatar` field)
- Stores file in `uploads/avatars/` with timestamp-based naming
- Updates `users` table with avatar URL
- Returns: Avatar URL

**Get Profile** (`GET /api/profile`):
- Requires: JWT token
- Retrieves: Username, email, avatar URL, account creation date
- Returns: User profile data

**Delete Avatar** (`DELETE /api/avatar`):
- Requires: JWT token
- Deletes file from disk permanently
- Sets `avatar_url` to NULL in database
- Returns: Success message

### 4. **Gallery Management**

**Upload Gallery Images** (`POST /api/upload/gallery`):
- Requires: JWT token
- Accepts: Up to 10 images (`images` field) + optional captions
- Stores files in `uploads/gallery/`
- Inserts each image record with caption to database
- Returns: Array of uploaded images with IDs and URLs

**Get All Gallery Images** (`GET /api/gallery`):
- Requires: JWT token
- Features:
  - **Pagination**: `?page=1&limit=10`
  - **Search**: `?search=keyword` (searches captions)
  - **Sorting**: By creation date (newest first)
- Returns: Page data, total pages, image list

**Get Single Image** (`GET /api/gallery/:id`):
- Requires: JWT token
- Retrieves: Full image details including caption and creation date

**Update Caption** (`PUT /api/gallery/:id`):
- Requires: JWT token
- Accepts: `captions` in request body
- Updates caption for specific image
- Ownership verified (user can only edit own images)
- Returns: Updated image data

**Delete Image** (`DELETE /api/gallery/:id`):
- Requires: JWT token
- Deletes file from disk
- Removes record from database
- Ownership verified before deletion
- Returns: Success message

## 🔐 Security Features

| Feature | Implementation |
|---------|-----------------|
| Password Hashing | Bcrypt with salt rounds = 10 |
| Authentication | JWT with 7-day expiration |
| Token Verification | Bearer token in Authorization header |
| Data Ownership | User ID verified on all operations |
| CORS | Enabled for all origins |
| Input Validation | Required fields checked before processing |

## 📦 Database Schema (Required)

The system expects the following MySQL database structure:

### `users` Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `gallery` Table
```sql
CREATE TABLE gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  captions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MySQL server running
- `.env` file with configuration

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Create `.env` file** with:
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=gallery_db
JWT_SECRET_KEY=your_secret_key_here
```

3. **Create database tables** (see schema above)

4. **Start the server**:
```bash
npm start
```

Server runs on **http://localhost:4000**

## 📡 API Endpoints Summary

| Method | Endpoint | Authentication | Purpose |
|--------|----------|-----------------|---------|
| POST | `/api/signup` | ❌ | Create new account |
| POST | `/api/login` | ❌ | Login and get token |
| POST | `/api/upload/avatar` | ✅ | Upload profile picture |
| GET | `/api/profile` | ✅ | Get user profile |
| DELETE | `/api/avatar` | ✅ | Remove profile picture |
| POST | `/api/upload/gallery` | ✅ | Upload gallery images |
| GET | `/api/gallery` | ✅ | List user's images |
| GET | `/api/gallery/:id` | ✅ | Get specific image |
| PUT | `/api/gallery/:id` | ✅ | Update image caption |
| DELETE | `/api/gallery/:id` | ✅ | Delete image |

## 📁 File Organization

- **Request Body Files** → Uploaded to `uploads/avatars/` or `uploads/gallery/`
- **File Naming**: `timestamp-originalname` (e.g., `1704067200000-photo.jpg`)
- **Static Files**: Served from `Public/` directory
- **Image Access**: Via `/uploads/avatars/` and `/uploads/gallery/` routes

## 🔄 Data Flow Example

### Complete User Journey

```
1. User registers
   POST /api/signup → Create account → Get userId

2. User logs in
   POST /api/login → Verify credentials → Get JWT token

3. User uploads avatar
   POST /api/upload/avatar (with token) → File saved → DB updated

4. User uploads gallery
   POST /api/upload/gallery (with token) → Files saved → DB records created

5. User retrieves gallery
   GET /api/gallery (with token) → DB query → Return paginated results

6. User updates image caption
   PUT /api/gallery/:id (with token) → Update DB → Return updated data
```

## 💡 Key Features

✨ **Multi-Image Upload** - Upload up to 10 images at once  
🔍 **Search & Filter** - Search gallery captions with pagination  
🎯 **Pagination** - Customizable page size and navigation  
👤 **Profile Management** - Update avatar and view profile info  
🔒 **Ownership Control** - Users can only manage their own content  
⚡ **Fast File Operations** - Optimized disk I/O for file management  
📅 **Timestamps** - Track creation dates for all content

## ⚙️ Configuration

All sensitive data is managed through environment variables in `.env`:
- Database credentials
- JWT secret key
- Port number (if modified)

Never commit `.env` to version control!

---

**Version**: 1.0.0  
**License**: ISC
