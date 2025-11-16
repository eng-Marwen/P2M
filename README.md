# P2M 2025
Samsar ProMax - Rental Management Platform
📖 Project Overview
Samsar ProMax is a comprehensive Web application-based rental management platform that provides a seamless, personalized, and scalable property rental experience. The platform connects tenants and property owners, enabling efficient property search, listing, and management.

🎯 Problem Statement
Traditional rental applications often lack personalization, data intelligence, and automated management:

Tenants struggle to find suitable properties

Property owners face challenges in setting competitive prices and engaging tenants

Manual processes slow down innovation and reliability

✨ Features
User Accounts: Secure login for Tenants, Owners, and Admin roles

Property Management: Add, edit, and track rental listings

Smart Search: Filter by location, price, amenities with map view

Online Payments: Secure rent payments and digital contracts

In-App Chat: Direct communication between tenants and owners

Maintenance Requests: Report and manage repairs efficiently

Analytics: Track income, occupancy, and property performance

🏗️ Tech Stack
Backend
Runtime: Node.js

Framework: Express.js

Database: MongoDB

Authentication: JWT / Firebase Auth

Email Service: Mailtrap

Frontend
Framework: React.js

Styling: CSS3

Backend Integration: Supabase Client

Authentication: Firebase

Development Server: Vite (Port 5173)

📁 Project Structure
text
samsar-promax/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── sendingMails/
│   ├── mailtrap/
│   ├── .env
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── popups/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   └── supabaseClient.js
│   ├── public/
│   ├── .env
│   └── eslint.config.js
├── .gitignore
└── README.md
🚀 Installation & Setup
Prerequisites
Node.js (v14 or higher)

MongoDB installed locally or cloud connection

npm or yarn package manager

Backend Setup
Navigate to backend directory:

bash
cd backend
Install dependencies:

bash
npm install
Configure environment variables:
Create/update .env file in backend directory with:

env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_CONFIG=your_firebase_config
MAILTRAP_API_KEY=your_mailtrap_key
Start the backend server:

bash
npm run start
Backend will run on http://localhost:3000

Frontend Setup
Navigate to frontend directory:

bash
cd frontend
Install dependencies:

bash
npm install
Configure environment variables:
Create/update .env file in frontend directory with:

env
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_CONFIG=your_firebase_config
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
Start the development server:

bash
npm run dev
Frontend will run on http://localhost:5173

🔧 Environment Variables
Backend (.env)
PORT: Server port (default: 3000)

MONGODB_URI: MongoDB connection string

JWT_SECRET: Secret key for JWT tokens

FIREBASE_CONFIG: Firebase configuration

MAILTRAP_API_KEY: Mailtrap API key for emails

Frontend (.env)
VITE_API_BASE_URL: Backend API base URL

VITE_FIREBASE_CONFIG: Firebase configuration

VITE_SUPABASE_URL: Supabase project URL

VITE_SUPABASE_KEY: Supabase API key

🤝 Contribution
Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🏆 Acknowledgments
React.js community

MongoDB Atlas

Firebase team

Supabase team

Mailtrap service

Samsar ProMax - Revolutionizing rental management with technology and intelligence.

