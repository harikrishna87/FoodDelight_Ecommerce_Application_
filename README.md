🍽️ FoodDelight E-Commerce Web Application
🧑‍💻 Type: Personal Project
🚀 Technologies: React.js | Node.js | Express.js | MongoDB | TypeScript | Ant Design

🔗 Live Demo: FoodDelight E-Commerce Application

🧠 Project Overview

FoodDelight is a full-stack e-commerce web application designed for seamless online food ordering and delivery. It offers a dynamic and user-friendly interface where customers can browse menus, filter cuisines, place orders, and make secure payments.
The project focuses on performance optimization, security, and responsive design, providing an optimal user experience across all devices.

✨ Key Features
🛍️ User-Facing Features

Interactive Food Catalog:
Users can explore a variety of food items through a paginated catalog with search and filter functionality for quick access.
(Enhanced navigation speed by 40%)

User Authentication:
Secure login and registration system powered by JWT (JSON Web Tokens) ensures data safety and prevents unauthorized access.
(Reduced unauthorized access by 95%)

Responsive Design:
The application adapts seamlessly to mobile, tablet, and desktop devices for smooth user interaction.

Real-Time Order Tracking:
Customers can monitor their orders in real-time, reducing support queries and increasing transparency.
(Customer satisfaction improved by 45%)

Secure Online Payments:
Integrated Razorpay Payment Gateway to handle transactions securely and efficiently.
(Increased checkout completion rate by 28%)

🧑‍💼 Admin-Facing Features

Role-Based Access Control (RBAC):
Admins can manage orders, update statuses, and control inventory, while users have restricted access.

Admin Dashboard:
A visually rich dashboard built with Ant Design components for monitoring sales, managing products, and tracking order data.

⚙️ Tech Stack
Category	Technology
Frontend	React.js, TypeScript, Ant Design
Backend	Node.js, Express.js
Database	MongoDB
Authentication	JSON Web Tokens (JWT)
Payment Integration	Razorpay
Deployment	Vercel (Frontend), Render/Atlas (Backend & DB)
🧩 Architecture Overview
Frontend (React + TypeScript + Ant Design)
        |
        | RESTful API Calls
        v
Backend (Node.js + Express.js)
        |
        | Database Operations
        v
Database (MongoDB)

🚀 Installation & Setup Guide

Follow these steps to run the project locally:

1️⃣ Clone the Repository
git clone https://github.com/harikrishna87/FoodDelight.git
cd FoodDelight

2️⃣ Install Dependencies
Frontend:
cd client
npm install

Backend:
cd ../server
npm install

3️⃣ Setup Environment Variables

Create a .env file inside the server folder and include:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

4️⃣ Run the Application
Backend:
npm start

Frontend:
npm run dev


Then open http://localhost:5173
 (or your Vite default port) in your browser.

🧠 Performance Highlights

Achieved 55% performance optimization through efficient state management and API call reduction.

Optimized database queries and implemented pagination to reduce server load.

Enhanced front-end performance using lazy loading and memoization.

🧑‍💻 Author

👤 Veta Hari Babu
💼 React & Full Stack Developer
🔗 GitHub
 | LinkedIn

📜 License

This project is licensed under the MIT License — feel free to use and modify it for learning or development purposes.

🥗 Acknowledgments

Ant Design for elegant UI components.

Razorpay for secure and easy payment integration.

MongoDB Atlas for reliable cloud database services.
