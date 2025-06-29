from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from scrape import GeminiInvoiceOCRService
import asyncio

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OCR service
ocr_service = GeminiInvoiceOCRService()

@app.post("/api/ocr")
async def process_document(file: UploadFile = File(...)):
    try:
        # Read file contents
        contents = await file.read()
        
        # Process with OCR service
        result = await ocr_service.extract_invoice_data(contents)
        
        # Validate results
        validation = await ocr_service.validate_extraction(result.extracted_data)
        
        return {
            "success": result.success,
            "extracted_data": result.extracted_data.dict() if result.success else None,
            "confidence_score": result.confidence_score if result.success else 0,
            "validation": validation,
            "error_message": result.error_message if not result.success else None
        }
    except Exception as e:
        return {
            "success": False,
            "error_message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True) 