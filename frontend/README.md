# SDMS Frontend

A modern, responsive frontend for the Student Development Management System built with React, TypeScript, and Chakra UI.

## 🚀 Features

- **Modern UI/UX**: Dark mode design inspired by modern dashboard layouts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **TypeScript**: Full type safety and better development experience
- **Chakra UI**: Beautiful, accessible component library
- **React Query**: Efficient data fetching and caching
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **React Hook Form**: Form handling with validation

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Chakra UI** - Component library
- **React Query** - Data fetching
- **Zustand** - State management
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📦 Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with sidebar
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── LeaderboardPage.tsx
│   └── ...
├── services/           # API services
│   └── api.ts         # API client and endpoints
├── store/              # State management
│   └── authStore.ts   # Authentication state
├── theme.ts           # Chakra UI theme configuration
├── App.tsx            # Main app component
└── index.tsx          # App entry point
```

## 🎨 Design System

The frontend uses a custom dark theme with:

- **Primary Color**: Blue (#0967D2)
- **Background**: Dark gray (#171923)
- **Cards**: Slightly lighter gray (#1A202C)
- **Text**: White and gray variations
- **Font**: Inter (Google Fonts)

## 🔐 Authentication

The app uses JWT-based authentication with:

- Login/Signup forms
- Protected routes
- Role-based access control (Student/Admin)
- Persistent authentication state

## 📱 Responsive Design

- **Desktop**: Sidebar navigation
- **Mobile**: Drawer navigation with hamburger menu
- **Tablet**: Adaptive layout

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 🔧 Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:4000/api
```

## 📄 Pages

1. **Login Page** - Authentication
2. **Dashboard** - Overview and stats
3. **Leaderboard** - Student rankings
4. **Profile** - Student profile management
5. **Events** - Workshops and hackathons
6. **Coding Stats** - LeetCode/HackerRank tracking
7. **Certifications** - Certificate upload/verification
8. **Notifications** - System notifications
9. **Admin Dashboard** - Admin controls (Admin only)
10. **Admin Logs** - System logs (Admin only)

## 🎯 Next Steps

- [ ] Complete all page implementations
- [ ] Add form validation
- [ ] Implement file upload for certifications
- [ ] Add real-time notifications
- [ ] Add search and filtering
- [ ] Add data export functionality
- [ ] Add comprehensive error handling
- [ ] Add loading states and skeletons
- [ ] Add unit tests
- [ ] Add E2E tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the SDMS (Student Development Management System).
