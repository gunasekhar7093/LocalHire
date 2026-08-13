# LocalHire - Social Hiring Platform

LocalHire is a social hiring platform connecting people looking for workers with people looking for work. It functions similarly to Instagram for browsing posts and WhatsApp for real-time messaging between users.

## Features

- **Authentication**: JWT-based secure authentication (Register/Login).
- **Dual Post System**: Users can create "Skill Posts" (looking for work) or "Vacancy Posts" (looking for workers).
- **Explore Feed**: Browse all posts with filtering by category, location, and keywords.
- **Real-Time Messaging**: Built-in chat using Socket.IO for immediate communication.
- **Privacy Controls**: Users can choose to make their phone number public or keep it private (forcing contact through the built-in messaging system).
- **Responsive UI**: A modern, sleek interface built with React and custom CSS3.

## Tech Stack

- **Frontend**: React, Vite, React Router DOM, Axios, Socket.io-client.
- **Backend**: Node.js, Express.js, Socket.IO.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone or Download the repository**
2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add your variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/localhire  # Or your MongoDB Atlas URI
   JWT_SECRET=your_super_secret_jwt_key
   ```
   Start the backend server:
   ```bash
   npm run dev  # If nodemon is configured in scripts, otherwise: node server.js
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open Application**
   Navigate to `http://localhost:5173` in your browser.

## Deployment Preparation

### Backend (Render / Heroku)
1. Ensure your MongoDB Atlas URI is added to the environment variables on your hosting provider.
2. Set `NODE_ENV=production`.
3. Add a start script to `server/package.json`: `"start": "node server.js"`.

### Frontend (Vercel / Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder.
3. Ensure you set the backend API URL environment variable appropriately if moving away from `localhost:5000`.
