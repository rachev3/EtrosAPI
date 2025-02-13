# 🏀 Etros Basketball API

This is the backend API for the Etros Basketball Team website. It provides authentication, player and match management, article publishing, and image storage.

📈 **Status: In Development**  
⚠️ If there haven't been requests to the API anytime soon, it may take up to a minute to wake up.

👉 Built with:

- Node.js + Express.js
- MongoDB (Mongoose)
- Cloudinary (Image storage)
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
```

### 4️⃣ Start the API

```sh
npm run dev
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

✅ **Full API documentation:** [Swagger UI](https://etrosapi.onrender.com/api-docs)

## 📝 License

This project is licensed under the MIT License.
