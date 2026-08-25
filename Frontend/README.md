Frontend/
│
├── public/ # Public/static files that don't need React imports
│
├── src/
│ │
│ ├── assets/ # Images, logos, icons and other frontend assets
│ │
│ ├── components/ # Reusable UI components
│ │ ├── common/ # Common components: Button, Input, Modal, Loader, Pagination
│ │ ├── layout/ # Navbar, Sidebar, Footer, DashboardLayout
│ │ ├── project/ # Reusable project-related UI components
│ │ ├── application/ # Reusable application-related UI components
│ │ └── user/ # Reusable user/profile-related components
│ │
│ ├── pages/ # Complete application screens/pages
│ │ ├── auth/ # Login, Register, Forgot Password, Reset Password
│ │ ├── client/ # Client Dashboard, My Projects, Applications
│ │ ├── freelancer/ # Freelancer Dashboard, Applied Projects, My Work
│ │ ├── projects/ # Project List, Project Details, Create/Edit Project
│ │ └── profile/ # User profile and profile editing pages
│ │
│ ├── services/ # Communication with Django REST API
│ │ ├── api.js # Axios instance and common API configuration
│ │ ├── authService.js # Login, register, logout, password APIs
│ │ ├── projectService.js # Project-related API calls
│ │ ├── applicationService.js # Apply, accept, reject, application APIs
│ │ └── userService.js # Profile/user-related API calls
│ │
│ ├── store/ # Redux Toolkit global state management
│ │ ├── store.js # Main Redux store configuration
│ │ └── slices/ # Separate Redux state for different features
│ │ ├── authSlice.js # Logged-in user, authentication, role
│ │ ├── projectSlice.js # Projects and project-related state
│ │ ├── applicationSlice.js # Applications and application status
│ │ └── userSlice.js # User/profile state
│ │
│ ├── hooks/ # Reusable custom React hooks
│ │
│ ├── routes/ # React Router configuration
│ │ └── AppRoutes.jsx # Application routes and protected routes
│ │
│ ├── utils/ # Reusable helper functions
│ │ # Example: date formatting, currency formatting, validation
│ │
│ ├── constants/ # Fixed values used throughout the application
│ │ # Example: user roles, status values, API constants
│ │
│ ├── App.jsx # Main React application component
│ │
│ ├── main.jsx # React application entry point
│ │
│ └── index.css # Global CSS/styles
│
├── .env # Local environment variables
├── .env.production # Production environment variables
├── package.json # Dependencies and project scripts
├── vite.config.js # Vite configuration
└── README.md # Frontend project documentation
