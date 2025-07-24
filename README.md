# ![KulkasKu Logo](frontend/public/kulkasku-logo-1.ico) KulkasKu - Smart Fridge Management System

> **Aplikasi web berbasis AI untuk mengelola stok makanan di kulkas secara efisien dan cerdas**

## 📖 Deskripsi

KulkasKu adalah aplikasi web modern yang mengintegrasikan teknologi untuk membantu pengguna mengelola stok makanan di kulkas mereka. Aplikasi ini menyediakan berbagai metode input yang inovatif seperti scan barcode, foto makanan dengan AI, dan scan struk belanja untuk otomatisasi penambahan item.

### ✨ Fitur Utama

- 🔍 **Smart Scanning**: Barcode, foto makanan, dan struk belanja dengan AI
- 🤖 **AI Prediction**: Prediksi daya tahan makanan berdasarkan kondisi visual
- 📱 **Responsive Design**: Web app yang optimal di desktop dan mobile
- 📊 **Filter & Sorting**: Pencarian dan pengurutan item yang advanced
- 🔔 **Expiry Notification**: Peringatan otomatis untuk item yang akan kadaluwarsa
- 🍳 **Recipe Recommendation**: Saran resep berdasarkan bahan yang tersedia
- 📈 **Analytics**: Tracking interaksi dan usage patterns

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.3.5 dengan App Router
- **UI Library**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **State Management**: Zustand + React Hook Form
- **HTTP Client**: Axios
- **Camera/Scanner**: Browser APIs + ZXing
- **Notifications**: Sonner (Toast)

### Backend (Go)
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL dengan GORM
- **Architecture**: Clean Architecture + Service Layer
- **File Upload**: Multipart form handling
- **API**: RESTful dengan JSON responses

### Backend AI (Python)
- **Framework**: FastAPI
- **AI Services**: 
  - Google Cloud Vision API
  - Google Gemini AI
  - Custom OCR processing
- **Image Processing**: PIL, OpenCV
- **HTTP Client**: httpx untuk microservice communication

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **Environment**: Environment variables configuration
- **Development**: Hot reload dengan Air (Go) dan Uvicorn (Python)

## 📁 Struktur Proyek

```
TeamName_KulkasKu/
├── frontend/                 # Next.js React App
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Go API Server
│   ├── cmd/                 # Application entry points
│   ├── controller/          # HTTP handlers
│   ├── service/             # Business logic
│   ├── database/            # Database models & migrations
│   ├── config/              # Configuration
│   └── go.mod
├── backend_ai/              # Python AI Service
│   ├── app/
│   │   ├── api.py          # FastAPI endpoints
│   │   └── services/       # AI service implementations
│   ├── requirements.txt
│   └── main.py
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 18+ untuk frontend
- **Go** 1.21+ untuk backend
- **Python** 3.8+ untuk AI service
- **PostgreSQL** untuk database
- **Google Cloud** credentials untuk AI services

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/TeamName_KulkasKu.git
cd TeamName_KulkasKu
```

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local dengan konfigurasi yang sesuai
npm run dev
```

### 3. Setup Backend Go
```bash
cd backend
go mod download
cp .env.example .env
# Edit .env dengan database credentials
go run cmd/main.go
```

### 4. Setup Backend AI
```bash
cd backend_ai
python -m venv venv
source venv/Scripts/activate  # Windows
# atau: source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
cp .env.example .env
# Edit .env dengan Google API credentials
python main.py
```

### 5. Database Setup
```bash
# Jalankan migrasi database
cd backend
go run seeder.go
```

## 🔧 Configuration

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend Go (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=kulkasku_db
PYTHON_AI_SERVICE_URL=http://localhost:8001
```

### Backend AI (.env)
```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_VISION_CREDENTIALS_PATH=path/to/credentials.json
```

## 🐳 Docker Deployment

Jalankan semua services dengan Docker Compose:

```bash
# Build dan jalankan semua containers
docker-compose up --build

# Jalankan di background
docker-compose up -d

# Stop semua services
docker-compose down
```

## 📝 API Documentation

### Main Endpoints

#### Items Management
- `GET /items` - Get all items dengan filter & sorting
- `POST /item/create` - Create new item
- `PUT /item/update` - Update existing item
- `DELETE /item/delete/:id` - Delete item

#### AI Services  
- `POST /predict/image` - Predict item dari foto
- `POST /receipt/scan` - Analyze receipt OCR
- `GET /barcode/:code` - Get product info by barcode

#### Recipe System
- `GET /recipe/recommendations` - Get recipe recommendations
- `GET /recipe/detail/:id` - Get recipe details
- `POST /recipe/track` - Track recipe interaction

## 🎯 Fitur yang Diimplementasikan

### ✅ Fridge Management
- Tambah item makanan (manual/scan)
- Edit dan hapus item
- Filter berdasarkan nama dan tanggal
- Sorting berdasarkan nama/jumlah/kadaluwarsa
- Notifikasi pengingat kadaluwarsa
- Tampilan kategori (fresh/expired)

### ✅ Smart Scanning
- Barcode scanning dengan ZXing
- AI image recognition (Google Vision + Gemini)
- Receipt OCR untuk multiple items
- Client-side image compression (90% quality)
- Real-time camera integration

### ✅ AI Features
- Prediksi daya tahan makanan
- Condition description dengan reasoning
- Confidence scoring
- Multiple AI service integration

### ✅ Recipe System
- Recipe recommendations berdasarkan ingredients
- Detailed recipe view dengan ingredients & steps
- Recipe interaction tracking
- Integration dengan food inventory

### ✅ User Experience
- Responsive mobile-first design
- Toast notifications dengan auto-close
- Loading states dan error handling
- Progressive image loading
- Smooth animations dan transitions

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 👥 Team

**TeamName_KulkasKu** - ITFest IPB 2025

- Frontend Development: React/Next.js implementation
- Backend Development: Go API server development  
- AI Development: Python AI services integration
- UI/UX Design: Modern responsive interface design

## 🙏 Acknowledgments

- Google Gemini AI untuk advanced reasoning
- ZXing library untuk barcode scanning
- Next.js team untuk amazing React framework
- Gin framework untuk efficient Go web development
- FastAPI untuk modern Python API development

---

<div align="center">

**🥬 KulkasKu - Making Fridge Management Smart & Simple**

[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Powered by Go](https://img.shields.io/badge/Powered%20by-Go-00ADD8?style=flat-square&logo=go)](https://golang.org/)
[![AI by Python](https://img.shields.io/badge/AI%20by-Python-3776AB?style=flat-square&logo=python)](https://python.org/)

</div>