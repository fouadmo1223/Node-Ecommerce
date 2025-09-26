# 🛍️ E-commerce REST API (Node.js + Express + MongoDB)

A fully-featured **E-commerce API** built with **Node.js, Express, MongoDB, and JWT authentication**.  
This project provides authentication, product management, categories, cart, and order handling.

---

## 🚀 Features

- 🔐 **Authentication & Authorization** (JWT)
- 👤 **User Management** (CRUD, profile, block/unblock)
- 🛍️ **Product Management** (CRUD, pagination, filtering, sorting, search)
- 📂 **Categories & Subcategories**
- 🛒 **Cart System** (add, update, remove items)
- 📦 **Order Management**
- 🔎 **Advanced Filtering** (`gte`, `lte`, `gt`, `lt`)
- ✅ **Validation** with `express-validator`
- 🔒 **Password Hashing** with `bcryptjs`
- 📧 **Email Handling** with `nodemailer`

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Validation:** express-validator
- **Other Tools:** bcryptjs, dotenv, nodemailer, slugify, morgan

---

## 📂 Project Structure

e-coomerce-nodejs/
│── models/ # Mongoose models (User, Product, Category, Order, etc.)
│── controllers/ # Route controllers
│── routes/ # Express route files
│── middleware/ # Auth & error middleware
│── utils/ # Helper functions
│── index.js # App entry point
│── .env # Environment variables
│── package.json

yaml
Copy code

---

## ⚙️ Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-username/e-coomerce-nodejs.git
cd e-coomerce-nodejs

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start in development mode
npm run dev

# Or start in production
npm start
🔑 Environment Variables
Create a .env file in the project root:

env
Copy code
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
📌 API Endpoints
All routes return JSON responses.

🔐 Auth Routes
👉 Register User
POST /api/auth/register

Body:

json
Copy code
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
Response:

json
Copy code
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "650c8e1f5c8d2f1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
👉 Login User
POST /api/auth/login

Body:

json
Copy code
{
  "email": "john@example.com",
  "password": "123456"
}
Response:

json
Copy code
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "650c8e1f5c8d2f1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
👤 User Routes
👉 Get All Users
GET /api/users?page=1&limit=10&sort=asc&keyword=john

Response:

json
Copy code
{
  "success": true,
  "message": "Users fetched successfully",
  "page": 1,
  "limit": 10,
  "total": 3,
  "data": [
    {
      "id": "650c8e1f5c8d2f1234567890",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
👉 Get My Profile
GET /api/users/my-profile (Requires JWT)

👉 Update User
PUT /api/users/:id

Body (optional fields):

json
Copy code
{
  "name": "John Updated",
  "phone": "123456789"
}
👉 Delete User
DELETE /api/users/:id

👉 Block / Unblock User
PATCH /api/users/:id/block

🛍️ Product Routes
👉 Get All Products
GET /api/products?page=1&limit=10&sort=asc

👉 Get Single Product
GET /api/products/:id

👉 Create Product
POST /api/products (Admin only)

json
Copy code
{
  "name": "iPhone 15",
  "price": 1200,
  "discount": 10,
  "category": "650c8d5f5c8d2f1234567890"
}
👉 Update Product
PUT /api/products/:id

👉 Delete Product
DELETE /api/products/:id

📂 Category Routes
👉 Get All Categories
GET /api/categories

👉 Create Category
POST /api/categories

json
Copy code
{
  "name": "Electronics"
}
📑 SubCategory Routes
👉 Create SubCategory
POST /api/subcategories

json
Copy code
{
  "name": "Smartphones",
  "category": "650c8d5f5c8d2f1234567890"
}
🛒 Cart Routes
👉 Add Item to Cart
POST /api/cart

json
Copy code
{
  "productId": "650c8e1f5c8d2f1234567890",
  "quantity": 2
}
👉 Remove Item from Cart
DELETE /api/cart/:productId

👉 Update Quantity
PATCH /api/cart/:productId

json
Copy code
{
  "quantity": 3
}
📦 Order Routes
👉 Place Order
POST /api/orders

json
Copy code
{
  "cartId": "650c9f5f5c8d2f1234567891",
  "address": "123 Main Street, Cairo, Egypt"
}
👉 Get My Orders
GET /api/orders/my-orders

👉 Cancel Order
DELETE /api/orders/:id

🧪 Testing
You can test endpoints with Postman or cURL:

bash
Copy code
curl -X GET http://localhost:5000/api/products
🤝 Contribution
Fork the project

Create a new feature branch (git checkout -b feature/new-feature)

Commit changes (git commit -m "Added new feature")

Push to your branch (git push origin feature/new-feature)

Create a Pull Request

