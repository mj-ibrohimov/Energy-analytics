from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ocr")
async def process_document(file: UploadFile = File(...)):
    try:
        # For now, just return a mock response
        # In the future, this will integrate with the OCR service
        
        mock_data = {
            "invoice_number": "INV-2024-001",
            "date": "2024-01-15",
            "buyer_info": {
                "company_name": "Test Company",
                "contact_person": "John Doe",
                "phone": "+1234567890",
                "address": "123 Test Street, Test City"
            },
            "supplier_info": {
                "company_name": "Test Supplier",
                "address": "456 Supplier Ave, Supplier City",
                "phone": "+0987654321"
            },
            "items": [
                {
                    "item_number": 1,
                    "product_name": "Test Product",
                    "specification": "Standard",
                    "quantity": 2,
                    "unit": "pieces",
                    "unit_price": 100.0,
                    "amount": 200.0
                }
            ],
            "subtotal": 200.0,
            "tax_amount": 20.0,
            "shipping_cost": 10.0,
            "discount": 0.0,
            "total_amount": 230.0,
            "currency": "USD"
        }
        
        return {
            "success": True,
            "extracted_data": mock_data,
            "confidence_score": 0.95,
            "validation": {
                "is_valid": True,
                "issues": [],
                "warnings": [],
                "confidence": 0.95
            },
            "error_message": None
        }
    except Exception as e:
        return {
            "success": False,
            "error_message": str(e)
        }

@app.get("/")
async def root():
    return {"message": "OCR Server is running!"}

if __name__ == "__main__":
    uvicorn.run("simple_server:app", host="0.0.0.0", port=8000, reload=True) 