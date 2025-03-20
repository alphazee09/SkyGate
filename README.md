# SkyGate AI Detection Application

SkyGate is a comprehensive application designed to detect whether images and videos are AI-generated or authentic. The application leverages state-of-the-art detection algorithms, including Vision Transformers, ResNet50 NoDown architecture, metadata analysis, and pixel-level examination to provide accurate and detailed analysis results.

## Features

- **Advanced AI Detection**: Multiple detection methods working in concert to provide high accuracy
- **User-Friendly Interface**: Intuitive design with drag-and-drop upload and comprehensive result displays
- **Detailed Analysis**: Breakdown of detection factors with confidence scores and visualizations
- **Multi-Format Support**: Handles various image and video formats with different resolutions
- **Secure User Management**: Complete authentication system with profile management
- **Responsive Design**: Optimized for both desktop and mobile devices

## Tech Stack

### Backend
- Python 3.10+
- Flask 2.3.x
- PostgreSQL 14+ and MongoDB 6.0+
- TensorFlow 2.12+ and PyTorch 2.0+
- OpenCV 4.7+ and Pillow 9.5+

### Frontend
- TypeScript 5.0+
- React 18.2+
- Material-UI 5.13+
- React Router 6.10+

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16.0.0+
- PostgreSQL 14+
- MongoDB 6.0+

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/skygate.git
cd skygate
```

2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend
```bash
cd ../frontend
npm install
```

4. Start the application
```bash
# In the backend directory
python run.py

# In the frontend directory
npm start
```

5. Access the application at http://localhost:3000

## Documentation

For detailed documentation, please refer to the following:

- [Features Documentation](docs/features/features.md)
- [Tech Stack Documentation](docs/tech_stack/tech_stack.md)
- [Project Structure](docs/project_structure.md)
- [Installation Guide](docs/installation/installation.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
