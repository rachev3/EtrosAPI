# 🏀 Etros Basketball API

This is the backend API for the Etros Basketball Team website. It provides authentication, player and match management, article publishing, image storage, and automated match statistics processing from FIBA box score PDFs.

📈 **Status: Beta - Testing Phase**  
⚠️ The API is feature complete but requires test fixes before production deployment.
⚠️ If there haven't been requests to the API anytime soon, it may take up to a minute to wake up.

👉 Built with:

- Node.js + Express.js
- MongoDB (Mongoose)
- Cloudinary (Image storage)
- PDF-Parse (Match statistics processing)
- Jest (Testing)

## 🌍 Live API & Documentation

- 🚀 **Live API:** [https://etrosapi.onrender.com](https://etrosapi.onrender.com)

## ✨ Features

✅ User authentication (JWT)  
✅ Player management (CRUD)  
✅ Match & statistics tracking  
✅ Articles & news publishing  
✅ Image uploads (Admins only)  
✅ Automated FIBA box score PDF processing  
✅ Duplicate match detection  
✅ Preview functionality for PDF uploads  
✅ Comprehensive error handling with detailed error codes  
✅ Consistent API response format

## 🚨 Error Handling

The API includes a robust error handling system:

✅ Consistent error response format  
✅ Detailed error messages with error codes  
✅ Field-level validation errors  
✅ Machine-readable error codes for frontend handling  
✅ Proper HTTP status codes  
✅ Documentation for all error types

### Error Response Format

```json
{
  "success": false,
  "status": 400,
  "message": "Error message explaining what went wrong",
  "errorCode": "ERROR_CODE",
  "details": {
    // Additional error details (specific to the error)
  }
}
```

### Documentation

- See [src/docs/error-handling.md](src/docs/error-handling.md) for implementation details
- See [src/docs/error-codes.md](src/docs/error-codes.md) for a comprehensive list of error codes

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
MONGODB_URI_TEST=your_test_mongo_db_uri

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

# Run tests
npm test
```

🚀 The API will start on `http://localhost:5000`

## 🧪 Testing

### Current Test Status

⚠️ **Known Issues:**

- Unit tests for PDF controller need fixes
- Integration tests require valid sample PDF
- Test infrastructure improvements needed

### Running Tests

```sh
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage report
npm run test:coverage
```

### Test Structure

```
src/__tests__/
├── unit/
│   ├── controllers/
│   │   └── pdfController.test.js
│   └── utils/
│       └── pdfParser.test.js
├── integration/
│   └── pdfUpload.test.js
└── __fixtures__/
    └── sample_match.pdf
```

### Test Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: Key workflows covered
- E2E Tests: Critical user paths

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
| POST   | `/api/pdf/preview`    | Preview PDF before upload   | Admin only |
| POST   | `/api/pdf/confirm`    | Confirm and save preview    | Admin only |
| GET    | `/api/pdf/status/:id` | Check PDF processing status | Admin only |

### **Match Routes**

| Method | Endpoint           | Description     |
| ------ | ------------------ | --------------- |
| GET    | `/api/matches`     | Get all matches |
| GET    | `/api/matches/:id` | Get match by ID |
| POST   | `/api/matches`     | Create match    |
| PUT    | `/api/matches/:id` | Update match    |

## 📊 PDF Processing

The API supports automated processing of FIBA box score PDFs:

### Features

- Extracts match metadata (date, venue, teams, scores)
- Processes team-level statistics
- Extracts individual player statistics
- Automatically creates/updates player records
- Prevents duplicate match uploads
- Handles DNP (Did Not Play) cases
- Updates player statistics history
- Preview functionality before final submission
- Confirmation step to ensure data accuracy
- Rollback capability if errors occur during processing

### Supported PDF Format

- FIBA box score format
- Maximum file size: 5MB
- Must contain both team and player statistics
- Supports both home and away team scenarios

### Processing Flow

1. Admin uploads PDF for preview
2. System validates file format
3. System extracts and returns preview data
4. Admin reviews the extracted data
5. If data is correct:
   - Admin confirms via confirmation endpoint
   - System processes and stores match data
   - Player statistics are updated
6. If data needs adjustment:
   - Admin can re-upload with corrected PDF
   - Or manually adjust data after confirmation

## 📝 License

This project is licensed under the MIT License.
