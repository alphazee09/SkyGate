# SkyGate AI Detection Application - Project Structure

## Overview

The SkyGate application follows a modular architecture with clear separation between frontend and backend components. This document outlines the project structure, explaining the purpose and organization of directories and key files.

## Root Directory Structure

```
SkyGate/
├── backend/           # Backend application code
├── frontend/          # Frontend application code
├── docs/              # Project documentation
└── README.md          # Project overview and quick start guide
```

## Backend Structure

```
backend/
├── src/                       # Source code
│   ├── api/                   # API endpoints and resources
│   │   ├── endpoints.py       # API route definitions
│   │   └── resources.py       # Resource classes for API endpoints
│   ├── detection/             # AI detection algorithms
│   │   └── detection_engine.py # Core detection functionality
│   ├── models/                # Database models
│   │   ├── postgresql_models.py # PostgreSQL database models
│   │   └── mongodb_models.py  # MongoDB database models
│   ├── utils/                 # Utility functions and helpers
│   │   ├── image_processing.py # Image processing utilities
│   │   └── metadata_analysis.py # Metadata analysis utilities
│   └── app.py                 # Main application entry point
├── requirements.txt           # Python dependencies
└── run.py                     # Application runner script
```

### Backend Components

#### API Module (`src/api/`)

The API module handles all HTTP requests and responses, implementing the RESTful API endpoints.

- **endpoints.py**: Defines the API routes and connects them to resource classes
- **resources.py**: Contains resource classes that implement the business logic for each endpoint

#### Detection Module (`src/detection/`)

The detection module contains the core AI detection algorithms and processing logic.

- **detection_engine.py**: Implements the main detection engine that orchestrates different detection methods

#### Models Module (`src/models/`)

The models module defines the database schemas and models for data persistence.

- **postgresql_models.py**: SQLAlchemy models for PostgreSQL database tables
- **mongodb_models.py**: PyMongo models for MongoDB collections

#### Utils Module (`src/utils/`)

The utils module provides helper functions and utilities used throughout the application.

- **image_processing.py**: Utilities for image manipulation and analysis
- **metadata_analysis.py**: Functions for extracting and analyzing file metadata

#### Application Files

- **app.py**: Configures and initializes the Flask application
- **run.py**: Entry point script for running the application
- **requirements.txt**: Lists all Python dependencies with version specifications

## Frontend Structure

```
frontend/
├── public/                    # Static files
│   ├── index.html             # HTML entry point
│   ├── manifest.json          # Web app manifest
│   └── assets/                # Static assets (images, icons)
├── src/                       # Source code
│   ├── components/            # Reusable UI components
│   ├── contexts/              # React context providers
│   │   └── AuthContext.tsx    # Authentication context
│   ├── layouts/               # Page layout components
│   │   ├── MainLayout.tsx     # Main application layout
│   │   └── AuthLayout.tsx     # Authentication pages layout
│   ├── pages/                 # Page components
│   │   ├── Dashboard.tsx      # Dashboard page
│   │   ├── Login.tsx          # Login page
│   │   ├── Register.tsx       # Registration page
│   │   ├── Upload.tsx         # File upload page
│   │   ├── Results.tsx        # Results listing page
│   │   ├── ResultDetail.tsx   # Detailed result view
│   │   ├── Profile.tsx        # User profile page
│   │   └── NotFound.tsx       # 404 page
│   ├── utils/                 # Utility functions
│   │   └── api.js             # API client utilities
│   ├── App.tsx                # Main application component
│   ├── index.tsx              # Application entry point
│   ├── theme.ts               # Theme configuration
│   └── index.css              # Global styles
├── package.json               # NPM dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── .env.development           # Development environment variables
```

### Frontend Components

#### Public Directory (`public/`)

Contains static files that are served directly without processing.

- **index.html**: The HTML template for the application
- **manifest.json**: Web app manifest for PWA support
- **assets/**: Static assets like images and icons

#### Source Directory (`src/`)

Contains all the React application code.

#### Components (`src/components/`)

Reusable UI components used throughout the application.

#### Contexts (`src/contexts/`)

React context providers for state management.

- **AuthContext.tsx**: Manages authentication state and user information

#### Layouts (`src/layouts/`)

Page layout components that provide consistent structure.

- **MainLayout.tsx**: Layout for authenticated pages with navigation
- **AuthLayout.tsx**: Layout for authentication pages

#### Pages (`src/pages/`)

Individual page components for different routes.

- **Dashboard.tsx**: Main dashboard with statistics and recent activity
- **Login.tsx**: User login page
- **Register.tsx**: User registration page
- **Upload.tsx**: File upload and processing page
- **Results.tsx**: List of detection results
- **ResultDetail.tsx**: Detailed view of a single detection result
- **Profile.tsx**: User profile management
- **NotFound.tsx**: 404 error page

#### Utils (`src/utils/`)

Utility functions and helpers.

- **api.js**: API client for communicating with the backend

#### Application Files

- **App.tsx**: Main application component with routing
- **index.tsx**: Application entry point
- **theme.ts**: Material-UI theme configuration
- **index.css**: Global CSS styles
- **package.json**: NPM dependencies and scripts
- **tsconfig.json**: TypeScript configuration
- **.env.development**: Environment variables for development

## Documentation Structure

```
docs/
├── features/              # Feature documentation
│   └── features.md        # Comprehensive feature list
├── tech_stack/            # Technology stack documentation
│   └── tech_stack.md      # Complete tech stack details
├── installation/          # Installation guides
│   └── installation.md    # Step-by-step installation instructions
├── database/              # Database documentation
│   └── database_schema.md # Database schema and design
└── research/              # Research documentation
    └── ai_detection_techniques.md # AI detection research findings
```

### Documentation Components

#### Features (`docs/features/`)

Documentation of application features and capabilities.

#### Tech Stack (`docs/tech_stack/`)

Details of all technologies, frameworks, and libraries used.

#### Installation (`docs/installation/`)

Step-by-step guides for installing and running the application.

#### Database (`docs/database/`)

Database schema design and documentation.

#### Research (`docs/research/`)

Research findings and technical background information.

## File Organization Principles

The SkyGate project follows these organizational principles:

1. **Separation of Concerns**: Clear separation between frontend and backend
2. **Modularity**: Code is organized into modules with specific responsibilities
3. **Reusability**: Common functionality is extracted into reusable components
4. **Scalability**: Structure supports adding new features without major refactoring
5. **Maintainability**: Consistent naming and organization for easy navigation

## Development Workflow

The recommended development workflow for the SkyGate project:

1. **Backend Development**:
   - Run the backend server using `python run.py`
   - Test API endpoints using Postman or curl

2. **Frontend Development**:
   - Run the frontend development server using `npm start`
   - The proxy configuration will forward API requests to the backend

3. **Full-Stack Development**:
   - Run both backend and frontend servers
   - Make changes to both components as needed
   - Test integration using the frontend UI

4. **Production Build**:
   - Build the frontend using `npm run build`
   - Deploy the backend and frontend to production servers
