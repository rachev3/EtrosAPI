# 🏀 Etros Basketball API

This is the backend API for the Etros Basketball Team website. It provides authentication, player and match management, article publishing, image storage, and automated match statistics processing from FIBA box score PDFs.

📈 **Status: In Development**  
⚠️ If there haven't been requests to the API anytime soon, it may take up to a minute to wake up.

👉 Built with:

- Node.js + Express.js
- MongoDB (Mongoose)
- Cloudinary (Image storage)
- PDF-Parse (Match statistics processing)
- Swagger (API Documentation)

## 🌍 Live API & Documentation

- 🚀 **Live API:** [https://etrosapi.onrender.com](https://etrosapi.onrender.com)
- 📚 **Swagger API Docs:** [https://etrosapi.onrender.com/api-docs](https://etrosapi.onrender.com/api-docs)

## ✨ Features

✅ User authentication (JWT)  
✅ Player management (CRUD)  
✅ Match & statistics tracking  
✅ Articles & news publishing  
✅ Image uploads (Admins only)  
✅ Automated FIBA box score PDF processing  
✅ Duplicate match detection  
✅ Swagger API documentation

## 🔧 Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/rachev3/EtrosAPI.git
cd EtrosAPI
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Create a `.env` File

```sh
# MongoDB
MONGO_URI=your_mongo_db_uri

# JWT Secret
JWT_SECRET=your_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Node Environment
NODE_ENV=development
```

### 4️⃣ Start the API

```sh
# Development mode
npm run dev

# Production mode
npm start
```

🚀 The API will start on `http://localhost:5000`

## 🔗 API Endpoints

### **Auth Routes**

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| POST   | `/api/auth/register` | Register new user  |
| POST   | `/api/auth/login`    | Login user         |
| GET    | `/api/auth/user`     | Get logged-in user |

### **Player Routes**

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| GET    | `/api/players`     | Get all players  |
| POST   | `/api/players`     | Add a new player |
| PUT    | `/api/players/:id` | Update a player  |
| DELETE | `/api/players/:id` | Delete a player  |

### **PDF Processing Routes**

| Method | Endpoint              | Description                 | Access     |
| ------ | --------------------- | --------------------------- | ---------- |
| POST   | `/api/pdf/upload`     | Upload & process match PDF  | Admin only |
| GET    | `/api/pdf/status/:id` | Check PDF processing status | Admin only |

### **Match Routes**

| Method | Endpoint           | Description     |
| ------ | ------------------ | --------------- |
| GET    | `/api/matches`     | Get all matches |
| GET    | `/api/matches/:id` | Get match by ID |
| POST   | `/api/matches`     | Create match    |
| PUT    | `/api/matches/:id` | Update match    |

✅ **Full API documentation:** [Swagger UI](https://etrosapi.onrender.com/api-docs)

## 📊 PDF Processing

The API supports automated processing of FIBA box score PDFs:

- Extracts match metadata (date, venue, teams, scores)
- Processes team-level statistics
- Extracts individual player statistics
- Automatically creates/updates player records
- Prevents duplicate match uploads
- Handles DNP (Did Not Play) cases
- Updates player statistics history

### Supported PDF Format

- FIBA box score format
- Maximum file size: 5MB
- Must contain both team and player statistics
- Supports both home and away team scenarios

## 📝 License

This project is licensed under the MIT License.
