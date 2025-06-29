# EnergySmart - Full-Stack Energy Management System

A comprehensive energy management platform with AI-powered invoice processing, real-time monitoring, and analytics.

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **Port**: 5173
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Key Features**:
  - Real-time energy dashboard
  - AI-powered invoice upload and analysis
  - Interactive chat interface
  - Anomaly detection and alerts
  - Document management with preview

### Backend (FastAPI + Python)
- **Port**: 8000
- **Framework**: FastAPI
- **Key Features**:
  - RESTful API with OpenAPI documentation
  - AI-powered OCR for invoice processing
  - Real-time data streaming
  - Anomaly injection for testing
  - File management and storage
  - Analytics and reporting

## 🚀 Quick Start

### Option 1: Use the Startup Script (Recommended)
```bash
./start.sh
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt  # If you have a requirements file

# Start the backend server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

## 📊 API Endpoints

### Dashboard & Energy Data
- `GET /dashboard/data` - Get dashboard overview data
- `GET /energy/data?limit=100` - Get energy consumption data
- `GET /energy/summary` - Get energy usage summary
- `GET /energy/anomalies?limit=50` - Get detected anomalies

### Real-time Monitoring
- `GET /realtime/status` - Get real-time system status
- `POST /realtime/start` - Start real-time data collection
- `POST /realtime/stop` - Stop real-time data collection
- `POST /realtime/inject-anomaly` - Inject test anomaly
- `GET /realtime/anomaly-types` - Get available anomaly types

### Invoice Management
- `POST /invoice/upload` - Upload and process invoice documents
- `GET /invoice/history` - Get invoice processing history
- `GET /invoice/detail/{invoice_id}` - Get specific invoice details
- `DELETE /invoice/delete/{invoice_id}` - Delete invoice and files
- `GET /view/invoice/{filename}` - View invoice document

### File Management
- `GET /files/list` - List all uploaded files
- `POST /upload/csv` - Upload CSV energy data
- `DELETE /csv/delete/{filename}` - Delete CSV file

### Analytics & Feedback
- `GET /analytics/user-behavior?days=7` - Get user behavior statistics
- `GET /analytics/realtime-data` - Get real-time analytics
- `GET /analytics/export` - Export all analytics data
- `POST /feedback/submit` - Submit user feedback
- `GET /feedback/summary?days=30` - Get feedback summary

## 🔧 Frontend-Backend Integration

### API Service Layer
The frontend uses a centralized API service (`src/services/api.ts`) that:
- Handles all HTTP requests to the backend
- Provides type-safe interfaces
- Manages error handling and response formatting
- Includes utility functions for data formatting

### Key Integration Points

#### 1. Invoice Upload & Processing
```typescript
// Frontend uploads file
const response = await apiService.uploadInvoice(file);

// Backend processes with AI OCR
// Returns extracted data, validation results, and confidence scores
```

#### 2. Real-time Dashboard
```typescript
// Frontend fetches live data every 30 seconds
const dashboardData = await apiService.getDashboardData();
const energyData = await apiService.getEnergyData(100);
const anomalies = await apiService.getEnergyAnomalies(10);
```

#### 3. Document Management
```typescript
// Frontend manages document lifecycle
await apiService.uploadInvoice(file);        // Upload
await apiService.getInvoiceHistory();        // List
await apiService.viewInvoiceImage(filename); // Preview
await apiService.deleteInvoice(invoiceId);   // Delete
```

## 📁 File Structure

```
Energy-analytics/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── Dashboard.tsx         # Main dashboard with real-time data
│   │   ├── InvoiceManagement.tsx # Invoice upload and management
│   │   ├── ChatInterface.tsx     # AI chat for document analysis
│   │   └── ...
│   ├── services/
│   │   └── api.ts               # Centralized API service
│   ├── data/
│   │   └── solarData.ts         # Local fallback data
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── scrape.py                    # AI OCR processing service
├── server.py                    # Main FastAPI application
├── simple_server.py             # Development/testing server
├── vite.config.ts              # Frontend build configuration
├── start.sh                    # Startup script
└── README.md                   # This file
```

## 🎯 Key Features

### 1. AI-Powered Invoice Processing
- **Upload Support**: PDF, DOC, PAGES, JPG, PNG files
- **OCR Extraction**: Automatic data extraction using Gemini AI
- **Validation**: Real-time validation with anomaly detection
- **Preview**: Document preview with extracted data display

### 2. Real-time Energy Monitoring
- **Live Dashboard**: Real-time energy generation and consumption
- **Anomaly Detection**: Automatic detection of unusual patterns
- **Status Monitoring**: System health and connectivity status
- **Data Visualization**: Interactive charts and metrics

### 3. Document Management
- **File Storage**: Secure file upload and storage
- **History Tracking**: Complete audit trail of processed documents
- **Search & Filter**: Advanced search and filtering capabilities
- **Bulk Operations**: Batch processing and management

### 4. Interactive Chat Interface
- **Document Q&A**: Ask questions about uploaded documents
- **AI Analysis**: Get insights and explanations
- **Context Awareness**: Understands document content and context

## 🔧 Configuration

### Environment Variables
Create a `.env` file for sensitive configuration:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_database_url_here
SECRET_KEY=your_secret_key_here
```

### Vite Proxy Configuration
The frontend automatically proxies API requests to the backend:
```typescript
// vite.config.ts
proxy: {
  '/dashboard': { target: 'http://localhost:8000' },
  '/energy': { target: 'http://localhost:8000' },
  '/invoice': { target: 'http://localhost:8000' },
  // ... other API routes
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting**: Check if port 8000 is available
2. **Frontend proxy errors**: Ensure backend is running on port 8000
3. **File upload failures**: Check file size limits and supported formats
4. **OCR processing errors**: Verify Gemini API key configuration

### Development Tips

1. **API Documentation**: Visit `http://localhost:8000/docs` for interactive API docs
2. **Real-time Testing**: Use the anomaly injection endpoint to test alerts
3. **File Management**: Use the file management endpoints to clean up test uploads
4. **Error Monitoring**: Check browser console and backend logs for detailed errors

## 📈 Usage Examples

### Upload and Analyze an Invoice
1. Navigate to "Invoice Management"
2. Click "Upload Invoice"
3. Select a PDF, DOC, or image file
4. Wait for AI processing to complete
5. Review extracted data and any detected anomalies

### Monitor Real-time Energy Data
1. Go to the main Dashboard
2. View live energy generation and consumption metrics
3. Check system status indicators
4. Review recent anomalies and alerts

### Chat with Documents
1. Use the Chat interface
2. Upload a document using the paperclip icon
3. Ask questions about the document content
4. Get AI-powered insights and analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This application integrates a React frontend with a FastAPI backend, providing a complete full-stack solution for energy management with AI-powered document processing. 