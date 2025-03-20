#!/bin/bash

# SkyGate Application Deployment Script
# This script packages the SkyGate application for deployment

echo "Starting SkyGate packaging process..."

# Create deployment directory
DEPLOY_DIR="skygate_deployment"
mkdir -p $DEPLOY_DIR

# Copy backend files
echo "Packaging backend components..."
mkdir -p $DEPLOY_DIR/backend
cp -r backend/src $DEPLOY_DIR/backend/
cp backend/requirements.txt $DEPLOY_DIR/backend/
cp backend/run.py $DEPLOY_DIR/backend/

# Build frontend
echo "Building frontend components..."
cd frontend
npm install
npm run build
cd ..

# Copy frontend build
echo "Packaging frontend components..."
mkdir -p $DEPLOY_DIR/frontend
cp -r frontend/build $DEPLOY_DIR/frontend/

# Copy documentation
echo "Including documentation..."
mkdir -p $DEPLOY_DIR/docs
cp -r docs/* $DEPLOY_DIR/docs/
cp README.md $DEPLOY_DIR/

# Create Docker files
echo "Creating Docker configuration..."
cat > $DEPLOY_DIR/docker-compose.yml << 'EOL'
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
EOL

cat > $DEPLOY_DIR/backend/Dockerfile << 'EOL'
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
EOL

cat > $DEPLOY_DIR/frontend/Dockerfile << 'EOL'
FROM nginx:alpine

COPY build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOL

cat > $DEPLOY_DIR/frontend/nginx.conf << 'EOL'
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
EOL

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOY.md << 'EOL'
# SkyGate Deployment Instructions

This package contains the SkyGate AI Detection Application ready for deployment.

## Quick Deployment with Docker

1. Edit the environment variables in `docker-compose.yml` to set your own passwords and secrets.

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application at http://localhost

## Manual Deployment

1. Set up PostgreSQL and MongoDB databases as described in the installation guide.

2. Install backend dependencies and start the backend server:
   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```

3. Serve the frontend build using a web server like Nginx.

For detailed deployment instructions, refer to the installation guide in the docs directory.
EOL

# Create a zip archive
echo "Creating deployment archive..."
zip -r skygate_deployment.zip $DEPLOY_DIR

echo "Packaging complete! Deployment archive created: skygate_deployment.zip"
echo "See $DEPLOY_DIR/DEPLOY.md for deployment instructions."
