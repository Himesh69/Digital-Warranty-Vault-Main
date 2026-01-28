# 📱 Digital Warranty Vault

A modern web application to digitally store, organize, and manage product warranty documents with real-time tracking, automated notifications, and QR code sharing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Django](https://img.shields.io/badge/Django-5.0-green.svg)
![React](https://img.shields.io/badge/React-19.2-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)

---

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user authentication
- 📄 **Warranty Management** - Add, edit, and track product warranties
- 📸 **Receipt Storage** - Upload and store receipt images
- 🔍 **OCR Scanning** - Extract warranty details from receipts (local only)
- 📊 **Dashboard** - Visual overview of all warranties
- ⏰ **Expiry Tracking** - Real-time warranty status monitoring
- 🔔 **Email Notifications** - Automated expiry reminders
- 📱 **QR Code Sharing** - Generate shareable QR codes for warranties
- 🎨 **Modern UI** - Beautiful, responsive design with TailwindCSS

---

## 🚀 Live Demo

- **Frontend**: [Coming Soon]
- **Backend API**: [Coming Soon]

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **QR Codes**: qrcode library

### Backend
- **Framework**: Django 5.0
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL
- **OCR**: Tesseract (local development only)
- **Image Processing**: Pillow, pdf2image

---

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### For OCR Features (Local Development Only):
- Tesseract OCR
- Poppler

---

## 🏃‍♂️ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Digital-Warranty-Vault-Main.git
cd Digital-Warranty-Vault-Main
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp ../.env.example .env

# Update .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

---

## 🌐 Deployment

This application can be deployed on free platforms:

### Recommended Setup:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Render PostgreSQL

### 📚 Deployment Guides:
1. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment overview
2. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist
3. **[DEPLOYMENT_ALTERNATIVES.md](DEPLOYMENT_ALTERNATIVES.md)** - Alternative platform options

### Quick Deploy:

#### Deploy to Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/Digital-Warranty-Vault-Main&root-directory=frontend)

#### Deploy to Render (Backend)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 📖 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[NGROK_SETUP.md](NGROK_SETUP.md)** - Local development with ngrok

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/warranty_vault
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### Frontend (.env.development)
```env
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 📱 Features in Detail

### Warranty Management
- Add warranties manually or via OCR scanning
- Track warranty status (Active, Expiring Soon, Expired)
- View warranty details and receipt images
- Edit and delete warranties

### Dashboard
- Visual overview of all warranties
- Quick stats (total, active, expiring soon, expired)
- Recent warranties list
- Warranty status distribution

### Notifications
- Automated email notifications for expiring warranties
- Customizable notification settings
- Email sent 30 days before expiry

### QR Code Sharing
- Generate unique QR codes for each warranty
- Share warranties with others via QR code
- Public, read-only view of warranty details

---

## ⚠️ Important Notes

### OCR Features
- **Tesseract OCR** is only available for local development
- OCR features will **NOT work** on free hosting platforms (Render, Vercel)
- For production OCR, consider:
  - Railway (supports system packages)
  - Fly.io (Docker support)
  - Paid hosting platforms

### File Storage
- Free hosting platforms have **ephemeral storage**
- Uploaded files may be deleted on server restart
- For production, use cloud storage:
  - Cloudinary (recommended)
  - AWS S3
  - Supabase Storage

### Free Tier Limitations
- **Render**: Services spin down after 15 minutes of inactivity
- **Render PostgreSQL**: Database expires after 90 days
- **Vercel**: 100GB bandwidth/month limit

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Django REST Framework team
- React and Vite communities
- TailwindCSS team
- All open-source contributors

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [documentation](DEPLOYMENT_GUIDE.md)
- Email: support@example.com

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Cloud storage integration (Cloudinary)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Warranty categories and tags
- [ ] Export warranties to PDF
- [ ] Bulk warranty import

---

**Made with ❤️ by [Your Name]**
