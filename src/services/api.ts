// API Service for EnergySmart Backend Communication
const API_BASE_URL = 'http://34.42.32.87:8001';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with the correct environment variable name
const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY || '');

// Helper function to convert File to base64
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const analyzeDocumentWithGemini = async (file: File, question?: string) => {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Get the Gemini 1.5 Flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare the prompt
    const basePrompt = `Please analyze this invoice/document and extract the following information:
    - Total amount
    - Subtotal (if present)
    - Tax amount (if present)
    - Date
    - Invoice number
    - Vendor/Company name
    - Line items (if present)
    ${question ? `\nAdditionally, please answer this specific question: ${question}` : ''}`;

    // Create image part from base64
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type
      }
    };

    // Generate content
    const result = await model.generateContent([basePrompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract structured data
    const extractedData = {
      raw_text: text,
      structured_data: await parseGeminiResponse(text)
    };

    return {
      success: true,
      extracted_data: extractedData
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      error_message: error instanceof Error ? error.message : 'Failed to analyze document'
    };
  }
};

// Helper function to parse Gemini's response into structured data
const parseGeminiResponse = async (text: string) => {
  try {
    // Get another Gemini model instance for parsing
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const parsePrompt = `Parse the following text into a structured JSON format with these fields:
    total_amount (number), subtotal (number), tax_amount (number), date (string), invoice_number (string), 
    vendor_name (string), line_items (array of objects with description and amount).
    If a field is not found, set it to null.
    
    Text to parse:
    ${text}`;

    const result = await model.generateContent(parsePrompt);
    const response = await result.response;
    const jsonStr = response.text();
    
    // Try to parse the JSON response
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse Gemini JSON response:', e);
      // Return a basic structure if parsing fails
      return {
        total_amount: null,
        subtotal: null,
        tax_amount: null,
        date: null,
        invoice_number: null,
        vendor_name: null,
        line_items: []
      };
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return null;
  }
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error_message?: string;
  message?: string;
}

// Dashboard Types
export interface DashboardData {
  total_energy_generated: number;
  total_energy_consumed: number;
  current_efficiency: number;
  monthly_savings: number;
  recent_anomalies: Anomaly[];
  energy_trend: EnergyDataPoint[];
  cost_analysis: CostAnalysis;
  facility_stats: FacilityStats[];
}

export interface CostAnalysis {
  current_month_cost: number;
  previous_month_cost: number;
  projected_savings: number;
  efficiency_score: number;
  cost_breakdown: {
    energy_charges: number;
    service_fees: number;
    taxes: number;
  };
}

export interface FacilityStats {
  facility_id: string;
  name: string;
  total_consumption: number;
  efficiency_score: number;
  cost_this_month: number;
  status: 'active' | 'inactive' | 'maintenance';
}

// Energy Data Types
export interface EnergyDataPoint {
  timestamp: string;
  energy_generated_kwh: number;
  energy_consumed_kwh: number;
  efficiency_percent: number;
  cost_usd: number;
  facility_id: string;
}

export interface Anomaly {
  id: string;
  type: 'efficiency_drop' | 'consumption_spike' | 'generation_drop' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
  facility_id: string;
  metrics?: {
    expected_value: number;
    actual_value: number;
    threshold: number;
  };
}

// Invoice Types
export interface InvoiceData {
  id: string;
  filename: string;
  upload_time: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_data: {
    invoice_number: string;
    date: string;
    due_date: string;
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    supplier_info: {
      company_name: string;
      address: string;
      phone?: string;
      email?: string;
    };
    items: InvoiceItem[];
    payment_terms: {
      due_days: number;
      discount_percent?: number;
      discount_days?: number;
    };
  };
  validation_status?: {
    is_valid: boolean;
    errors?: string[];
    warnings?: string[];
  };
}

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  energy_generated_kwh?: number;
  energy_used_kwh?: number;
  unit: string;
}

// Facility Types
export interface Facility {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  capacity_kw: number;
  installation_date: string;
  last_maintenance: string;
  status: 'active' | 'inactive' | 'maintenance';
  metrics: {
    lifetime_generation: number;
    lifetime_consumption: number;
    average_efficiency: number;
  };
}

class ApiService {
  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // ... rest of the methods remain the same ...
}

export const apiService = new ApiService();
export default apiService;