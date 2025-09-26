📑 SubCategory Routes
👉 Create SubCategory

POST /api/subcategories

{
  "name": "Smartphones",
  "category": "650c8d5f5c8d2f1234567890"
}

🛒 Cart Routes
👉 Add Item to Cart

POST /api/cart

{
  "productId": "650c8e1f5c8d2f1234567890",
  "quantity": 2
}

👉 Remove Item from Cart

DELETE /api/cart/:productId

👉 Update Quantity

PATCH /api/cart/:productId

{
  "quantity": 3
}

📦 Order Routes
👉 Place Order

POST /api/orders

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

curl -X GET http://localhost:5000/api/products

🤝 Contribution

Fork the project

Create a new feature branch (git checkout -b feature/new-feature)

Commit changes (git commit -m "Added new feature")

Push to your branch (git push origin feature/new-feature)

Create a Pull Request

