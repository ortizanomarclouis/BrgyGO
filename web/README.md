# BrgyGO Web Application

A React-based web application for BrgyGO (Barangay Digital Services).

## Features

- **Login Screen**: User authentication with email and password
- **Register Screen**: New user registration with full details
- **Dashboard Screen**: Main dashboard with sidebar navigation and content grid

## Project Structure

```
web/
├── public/
│   └── index.html
├── src/
│   ├── hooks/
│   │   ├── api.js
│   │   ├── useAuth.js
│   │   └── index.js
│   ├── screens/
│   │   ├── Login.js
│   │   ├── Login.css
│   │   ├── Register.js
│   │   ├── Register.css
│   │   ├── Dashboard.js
│   │   └── Dashboard.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env
├── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite

## Navigation

- **Login** → Can navigate to Register or Dashboard
- **Register** → Can navigate back to Login
- **Dashboard** → Can navigate back to Login via Logout

## Color Scheme

- Primary Green: `#2d9e52`
- Light Green: `#7ab56c`
- Background: `#f5f5f5`
- Light Gray: `#e8e8e8`

## API Integration

The application uses custom React hooks for backend communication:

- **api.js**: Axios configuration with interceptors for authentication
- **useAuth.js**: Authentication hooks (login, register, logout)
- **AuthProvider**: Context provider for global auth state

### Environment Variables

Create a `.env` file in the web directory:

```env
REACT_APP_API_URL=http://localhost:8080/brgygo
```

## Dependencies

- React 18.2.0
- React DOM 18.2.0
- React Icons 4.7.1
- Axios (for API calls)

## Future Enhancements

- Add routing with React Router
- Implement more API endpoints
- Add form validation
- Implement JWT token refresh
- Add form validation and error handling
- Implement actual authentication
- Add more dashboard widgets
- Implement responsive design improvements
