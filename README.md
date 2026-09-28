# 🎁 GiftPool — Split, Settle & Celebrate

GiftPool is a full-stack MERN (MongoDB, Express, React/Node) web application designed to make group gifting, expense sharing, and event budgeting effortless. It functions smoothly as an instant local calculator for quick guests, and seamlessly transitions into a cloud-synced platform when users sign in to save their pools across sessions.

---

## 🌐 Live Website Links

* **Frontend Live Application (Vercel)**: [https://giftpool-two.vercel.app](https://giftpool-two.vercel.app)[cite: 7]
* **Backend API Server (Render)**: [https://giftpool-backend.onrender.com](https://giftpool-backend.onrender.com)[cite: 6, 9]

---

## 🚀 Key Features

* **Dual Mode (Guest & Cloud Sync)**: Use the app instantly as a local calculator without logging in. Sign in or register to securely save and access your pools from anywhere via MongoDB Atlas.
* **Smart Equal Splitting**: Automatically calculates fair shares, pending amounts, overpayments, and individual balances in real-time.
* **Optimized Settlement Plan**: Automatically generates an optimized peer-to-peer debt-settling transaction list.
* **Instant UPI Integration**: Includes one-click QR code generation and deep links (`upi://`) for seamless payments via GPay, PhonePe, or Paytm.
* **Smart Data Importer & Excel Export**: Quickly paste raw lists to import participant data or export comprehensive CSV reports.
* **Dark/Light Theme**: Fully responsive mobile-friendly UI with an integrated dark/light mode toggle.

---

## 🛠️ Tech Stack

* **Frontend**: Static HTML5, CSS3, Modern JavaScript (ES6 Modules) hosted on **Vercel**.
* **Backend**: Node.js, Express.js REST API hosted on **Render**[cite: 9].
* **Database**: MongoDB Atlas (Cloud NoSQL Database).
* **Security & Auth**: Custom REST authentication with `bcryptjs` password hashing and secure session management.

---

## 📂 Project Directory Structure

```text
giftpool/
├── client/              # Frontend files (Vercel deployment target)
│   ├── index.html       # Main application layout and UI modals
│   ├── script.js        # Frontend logic, API calls, and UI controller
│   └── style.css        # Custom styles, themes, and responsive design
├── server/              # Backend files (Render deployment target)
│   ├── models/          # Mongoose schemas (User, Pool)
│   ├── routes/          # API route controllers (authRoutes, poolRoutes)
│   ├── package.json     # Backend dependencies
│   └── server.js        # Express application entry point
├── .gitignore           # Excludes node_modules and sensitive environment files
└── README.md            # Project documentation