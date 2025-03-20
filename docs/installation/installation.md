# SkyGate AI Detection Application - Installation Guide

## Overview

This guide provides step-by-step instructions for installing and running the SkyGate AI detection application. The installation process is divided into backend and frontend setup, followed by configuration and deployment options.

## Prerequisites

Before beginning the installation, ensure your system meets the following requirements:

### System Requirements

- **Operating System**: Ubuntu 20.04 LTS or newer (recommended), or any Linux distribution, macOS, or Windows with WSL
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB+ (16GB+ recommended for production)
- **Storage**: 50GB+ SSD (100GB+ recommended for production)
- **Internet Connection**: Required for downloading dependencies

### Required Software

- **Git**: Version control system
- **Python**: v3.10 or newer
- **Node.js**: v16.0.0 or newer
- **npm**: v8.0.0 or newer (usually comes with Node.js)
- **PostgreSQL**: v14 or newer
- **MongoDB**: v6.0 or newer
- **Docker** (optional): Latest stable version for containerized deployment
- **Docker Compose** (optional): Latest stable version for multi-container setup

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/skygate.git

# Navigate to the project directory
cd skygate
```

### 2. Backend Setup

#### 2.1. Create a Python Virtual Environment

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 2.2. Install Python Dependencies

```bash
# Install required packages
pip install -r requirements.txt
```

#### 2.3. Set Up PostgreSQL Database

```bash
# Log in to PostgreSQL
sudo -u postgres psql

# Create a database and user
CREATE DATABASE skygate;
CREATE USER skygate_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE skygate TO skygate_user;

# Exit PostgreSQL
\q
```

#### 2.4. Set Up MongoDB Database

```bash
# Start MongoDB service if not already running
sudo systemctl start mongod

# Create MongoDB database and user
mongosh
use skygate
db.createUser({
  user: "skygate_user",
  pwd: "your_password",
  roles: [{ role: "readWrite", db: "skygate" }]
})
exit
```

#### 2.5. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# Create and edit .env file
nano .env
```

Add the following environment variables:

```
# Database Configuration
POSTGRES_URI=postgresql://skygate_user:your_password@localhost/skygate
MONGODB_URI=mongodb://skygate_user:your_password@localhost:27017/skygate

# Application Configuration
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
UPLOAD_FOLDER=/path/to/upload/folder
MAX_CONTENT_LENGTH=50000000

# Development Settings
FLASK_APP=run.py
FLASK_ENV=development
DEBUG=True
```

#### 2.6. Initialize the Database

```bash
# Run database initialization script
python init_db.py
```

### 3. Frontend Setup

#### 3.1. Navigate to the Frontend Directory

```bash
# From the project root
cd frontend
```

#### 3.2. Install Node.js Dependencies

```bash
# Install dependencies
npm install
```

#### 3.3. Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Create and edit .env.local file
nano .env.local
```

Add the following environment variables:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### 4. Running the Application in Development Mode

#### 4.1. Start the Backend Server

```bash
# From the backend directory, with virtual environment activated
python run.py
```

The backend server will start at `http://localhost:5000`.

#### 4.2. Start the Frontend Development Server

```bash
# From the frontend directory
npm start
```

The frontend development server will start at `http://localhost:3000`.

### 5. Production Deployment

#### 5.1. Build the Frontend for Production

```bash
# From the frontend directory
npm run build
```

This will create a `build` directory with optimized production files.

#### 5.2. Configure the Backend for Production

Edit the `.env` file in the backend directory:

```
# Database Configuration
POSTGRES_URI=postgresql://skygate_user:your_password@localhost/skygate
MONGODB_URI=mongodb://skygate_user:your_password@localhost:27017/skygate

# Application Configuration
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
UPLOAD_FOLDER=/path/to/upload/folder
MAX_CONTENT_LENGTH=50000000

# Production Settings
FLASK_APP=run.py
FLASK_ENV=production
DEBUG=False
```

#### 5.3. Deploy with Docker (Recommended)

##### 5.3.1. Create a Docker Compose File

Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: skygate
      POSTGRES_USER: skygate_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  mongodb:
    image: mongo:6.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: skygate_user
      MONGO_INITDB_ROOT_PASSWORD: your_password
      MONGO_INITDB_DATABASE: skygate
    volumes:
      - mongodb_data:/data/db
    restart: always

  backend:
    build: ./backend
    depends_on:
      - postgres
      - mongodb
    environment:
      - POSTGRES_URI=postgresql://skygate_user:your_password@postgres/skygate
      - MONGODB_URI=mongodb://skygate_user:your_password@mongodb:27017/skygate
      - SECRET_KEY=your_secret_key
      - JWT_SECRET_KEY=your_jwt_secret_key
      - FLASK_APP=run.py
      - FLASK_ENV=production
      - DEBUG=False
    volumes:
      - uploads:/app/uploads
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
  mongodb_data:
  uploads:
```

##### 5.3.2. Create Dockerfiles

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
```

Create a `Dockerfile` in the frontend directory:

```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create an `nginx.conf` file in the frontend directory:

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

##### 5.3.3. Start the Docker Containers

```bash
# From the project root
docker-compose up -d
```

The application will be available at `http://localhost`.

#### 5.4. Traditional Deployment

##### 5.4.1. Set Up a Production Web Server (Nginx)

Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

Configure Nginx:

```bash
# Create a new site configuration
sudo nano /etc/nginx/sites-available/skygate
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        root /path/to/skygate/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/skygate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

##### 5.4.2. Set Up a Process Manager (Supervisor)

Install Supervisor:

```bash
sudo apt install supervisor
```

Create a configuration file:

```bash
sudo nano /etc/supervisor/conf.d/skygate.conf
```

Add the following configuration:

```ini
[program:skygate]
directory=/path/to/skygate/backend
command=/path/to/skygate/backend/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 run:app
autostart=true
autorestart=true
stderr_logfile=/var/log/skygate/skygate.err.log
stdout_logfile=/var/log/skygate/skygate.out.log
user=your_username
environment=
    POSTGRES_URI="postgresql://skygate_user:your_password@localhost/skygate",
    MONGODB_URI="mongodb://skygate_user:your_password@localhost:27017/skygate",
    SECRET_KEY="your_secret_key",
    JWT_SECRET_KEY="your_jwt_secret_key",
    FLASK_APP="run.py",
    FLASK_ENV="production",
    DEBUG="False"
```

Create log directory:

```bash
sudo mkdir -p /var/log/skygate
sudo chown your_username:your_username /var/log/skygate
```

Start the service:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start skygate
```

### 6. Verification

#### 6.1. Verify Backend API

```bash
# Test the API endpoint
curl http://localhost:5000/api/health
```

You should receive a JSON response indicating the API is working.

#### 6.2. Verify Frontend

Open a web browser and navigate to:

- Development: `http://localhost:3000`
- Production: `http://localhost` or `http://your_domain.com`

You should see the SkyGate login page.

## Troubleshooting

### Common Issues

#### Database Connection Errors

- Verify database credentials in `.env` file
- Ensure database services are running
- Check network connectivity between application and database servers

#### Frontend API Connection Issues

- Verify API URL in frontend environment variables
- Check CORS configuration in backend
- Ensure backend server is running and accessible

#### File Upload Problems

- Check upload directory permissions
- Verify maximum file size configuration
- Ensure disk space is available

### Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs:
   - Backend: Check console output or log files
   - Frontend: Check browser console for errors
   - Production: Check Nginx and Supervisor logs

2. Refer to the project documentation:
   - Review the tech stack documentation for specific component issues
   - Check the project structure documentation for file locations

3. Contact the development team:
   - Submit an issue on the project repository
   - Provide detailed information about the problem and steps to reproduce

## Maintenance

### Updating the Application

#### Backend Updates

```bash
# Pull latest changes
git pull

# Activate virtual environment
cd backend
source venv/bin/activate

# Install any new dependencies
pip install -r requirements.txt

# Restart the application
# For development:
python run.py
# For production with Supervisor:
sudo supervisorctl restart skygate
```

#### Frontend Updates

```bash
# Pull latest changes
git pull

# Navigate to frontend directory
cd frontend

# Install any new dependencies
npm install

# For development:
npm start
# For production:
npm run build
# Then copy the build directory to your web server
```

### Database Backups

#### PostgreSQL Backup

```bash
# Create a backup
pg_dump -U skygate_user -d skygate > skygate_postgres_backup.sql

# Restore from backup
psql -U skygate_user -d skygate < skygate_postgres_backup.sql
```

#### MongoDB Backup

```bash
# Create a backup
mongodump --uri="mongodb://skygate_user:your_password@localhost:27017/skygate" --out=skygate_mongo_backup

# Restore from backup
mongorestore --uri="mongodb://skygate_user:your_password@localhost:27017/skygate" skygate_mongo_backup
```

## Conclusion

You have successfully installed and configured the SkyGate AI detection application. The application is now ready for use, allowing users to detect AI-generated images and videos with advanced analysis techniques.

For more information about the application features and usage, refer to the features documentation in the `docs/features/` directory.
