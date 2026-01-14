# Samsar ProMax 🏡

**Samsar ProMax** - Modern Real Estate Platform for Property Listings and Management

## 📖 Project Overview

Samsar ProMax is a comprehensive full-stack web application for real estate management that provides a seamless, personalized property rental and sales experience. The platform connects property seekers with property owners, enabling efficient property search, listing management, and direct communication.

## 🎯 Problem Statement

Traditional rental and property sale applications often lack personalization, data intelligence, and automated management:

- **Property seekers** struggle to find suitable properties with advanced filtering
- **Property owners** face challenges in listing and managing their properties effectively
- **Manual processes** slow down communication and transaction flows
- Lack of integrated solutions for property images, user authentication, and email notifications

## ✨ Features

### User Management

- 🔐 **Secure Authentication**: JWT-based authentication with email verification
- 👤 **User Profiles**: Update profile information, avatar upload via Cloudinary
- 🔑 **Password Recovery**: Forgot password with OTP verification
- 🔥 **OAuth Integration**: Google sign-in via Firebase

### Property Management

- 🏠 **Create Listings**: Add properties with images, details, and pricing
- ✏️ **Edit Listings**: Update property information and images
- 🗑️ **Delete Listings**: Remove properties from the platform
- 📍 **Location-based**: Properties tagged with addresses
- 🏷️ **Property Types**: Support for rent and sale listings
- 🖼️ **Image Upload**: Multiple images per property via Cloudinary

### Search & Discovery

- 🔍 **Advanced Search**: Filter by location, type, price range, bedrooms, bathrooms
- 📊 **Property Cards**: Beautiful card-based property display
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS

### User Experience

- 🎨 **Modern UI**: Clean interface with Poppins font
- 🌓 **Loading States**: User-friendly loading indicators
- 📧 **Email Notifications**: Welcome emails and OTP verification via Gmail SMTP
- ⚡ **Real-time Updates**: Redux state management for instant UI updates
- 🎯 **Toast Notifications**: User feedback for all actions

## 🏗️ Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Cloudinary
- **Email Service**: Gmail SMTP (Nodemailer)
- **Security**: cookie-parser, CORS

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit + Redux Persist
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Authentication**: Firebase (OAuth)
- **UI Components**: React Icons, Swiper
- **Notifications**: React Toastify

## 📁 Project Structure

```
WEB_PROJECT/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts       # Authentication logic
│   │   │   ├── cloudinary.controller.ts # Image upload
│   │   │   └── house.controller.ts      # Property CRUD
│   │   ├── DB/
│   │   │   └── connectDB.ts             # MongoDB connection
│   │   ├── mailing-service/
│   │   │   ├── emails.ts                # Email sending logic
│   │   │   ├── emailTemplates.ts        # HTML email templates
│   │   │   └── mail.config.ts           # Gmail SMTP config
│   │   ├── middlewares/
│   │   │   └── verifyToken.ts           # JWT verification
│   │   ├── models/
│   │   │   ├── house.model.ts           # Property schema
│   │   │   └── user.model.ts            # User schema
│   │   ├── routes/
│   │   │   ├── auth.route.ts
│   │   │   ├── cloudinary.route.ts
│   │   │   └── house.route.ts
│   │   ├── utils/
│   │   │   └── generateTokenAndSetCookie.ts
│   │   ├── index.ts                     # Entry point
│   │   └── server.ts                    # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── store.ts                 # Redux store
│   │   │   └── user/
│   │   │       └── userSlice.ts         # User state slice
│   │   ├── components/
│   │   │   ├── Header.tsx               # Navigation bar
│   │   │   ├── House.tsx                # Property card component
│   │   │   ├── OAuth.tsx                # Google OAuth button
│   │   │   └── PrivateRoute.tsx         # Protected routes
│   │   ├── lib/
│   │   │   └── cloudinary.ts            # Cloudinary upload utility
│   │   ├── pages/
│   │   │   ├── About.tsx
│   │   │   ├── ContactUs.tsx
│   │   │   ├── CreateHouse.tsx          # Add property
│   │   │   ├── EditListing.tsx          # Edit property
│   │   │   ├── EmailVerification.tsx    # OTP verification
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Home.tsx                 # Landing page
│   │   │   ├── Listing.tsx              # Property details
│   │   │   ├── Profile.tsx              # User profile & listings
│   │   │   ├── ResetPassword.tsx
│   │   │   ├── Search.tsx               # Property search
│   │   │   ├── SignIn.tsx
│   │   │   ├── SignUp.tsx
│   │   │   └── VerifyResetOtp.tsx
│   │   ├── popups/
│   │   │   └── tostHelper.ts            # Toast notifications
│   │   ├── assets/                      # Images and static files
│   │   ├── App.tsx
│   │   ├── firebase.js                  # Firebase config
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.js
│   └── eslint.config.js
├── .gitignore
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager
- Cloudinary account
- Gmail account with App Password enabled
- Firebase project (for OAuth)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create `.env` file in backend directory:

```env
PORT=4000
CONNECTION_STRING=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP
MAIL_SERVICE_OWNER=your_gmail_address@gmail.com
MAIL_SERVICE_PASSWORD=your_gmail_app_password

NODE_ENV=development
PWD=your_mongodb_password
```

4. Start the backend server:

```bash
npm start
```

Backend will run on **http://localhost:4000**

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create `.env` file in frontend directory:

````env
# Firebase Configuration
VITE_API_KEY=your_firebase_api_key

4. Start the development server:

```bash
npm run dev
````

Frontend will run on **http://localhost:5173**

## 🔧 Environment Variables

### Backend (.env)

| Variable                | Description                          |
| ----------------------- | ------------------------------------ |
| `PORT`                  | Server port (default: 4000)          |
| `CONNECTION_STRING`     | MongoDB connection string            |
| `SECRET_KEY`            | Secret key for JWT tokens            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                   |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                |
| `MAIL_SERVICE_OWNER`    | Gmail address for sending emails     |
| `MAIL_SERVICE_PASSWORD` | Gmail app password                   |
| `NODE_ENV`              | Environment (development/production) |
| `PWD`                   | MongoDB password                     |

### Frontend (.env)

| Variable       | Description  |
| -------------- | ------------ |
| `VITE_API_KEY` | Firebase API |

## 📋 API Endpoints

### Authentication Routes

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-otp` - Verify reset OTP
- `POST /api/auth/reset-password` - Reset password
- `PATCH /api/auth/update-profile` - Update user profile
- `DELETE /api/auth/delete` - Delete user account

### House Routes

- `GET /api/houses` - Get all properties
- `GET /api/houses/:userId` - Get user's properties
- `GET /api/houses/listing/:id` - Get single property
- `POST /api/houses/create` - Create new property
- `PUT /api/houses/:id` - Update property
- `DELETE /api/houses/:id` - Delete property

### Cloudinary Routes

- `POST /api/cloudinary/upload` - Upload image to Cloudinary

## 🎨 Key Features Implementation

### Authentication Flow

1. User signs up with email, username, and password
2. OTP sent to email via Mailtrap
3. User verifies email with OTP
4. JWT token generated and stored in HTTP-only cookie
5. Redux stores user data with persistence

### Property Management Flow

1. Authenticated users can create listings
2. Images uploaded to Cloudinary
3. Property data stored in MongoDB
4. Users can view, edit, and delete their own listings
5. Public users can search and view all listings

### Search Functionality

- Filter by property type (rent/sale)
- Search by location
- Price range filtering
- Bedroom and bathroom count filtering
- Results displayed in responsive grid

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🏆 Acknowledgments

- React.js and TypeScript communities
- MongoDB and Mongoose
- Express.js framework
- Cloudinary for image management
- Gmail SMTP for email delivery
- Firebase for OAuth integration
- Tailwind CSS for styling
- Redux Toolkit for state management

---

**Samsar ProMax** - Revolutionizing real estate management with modern technology 🚀
