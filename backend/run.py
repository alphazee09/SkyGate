"""
SkyGate Application - Main Entry Point
This script initializes and runs the Flask application.
"""

import os
from src.app import create_app
from src.models.postgresql_models import db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask application
app = create_app()

# Initialize database
with app.app_context():
    db.init_app(app)
    # Uncomment to create tables on startup (development only)
    # db.create_all()

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Run application
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
