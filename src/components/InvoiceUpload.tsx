import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Download } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'processing' | 'completed' | 'error';
  extractedData?: {
    supplier: string;
    period: string;
    totalKwh: number;
    totalCost: number;
    facility: string;
    anomalies?: string[];
  };
}

const InvoiceUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        status: 'processing'
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      // Simulate file processing
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? {
                ...f,
                status: 'completed',
                extractedData: {
                  supplier: 'ENEL S.p.A.',
                  period: 'Nov 2024',
                  totalKwh: Math.floor(Math.random() * 5000) + 1000,
                  totalCost: Math.floor(Math.random() * 2000) + 500,
                  facility: 'Manufacturing Unit A',
                  anomalies: Math.random() > 0.7 ? ['Unit cost 12% above market rate'] : []
                }
              }
            : f
        ));
      }, 2000);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Invoice Upload & Analysis</h2>
        <p className="text-gray-600 mt-1">Upload energy invoices for automated parsing and validation</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop invoice files here or click to browse
        </h3>
        <p className="text-gray-500 mb-4">
          Supports PDF, CSV, Excel files up to 10MB
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block transition-colors"
        >
          Select Files
        </label>
      </div>

      {/* Processing Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What happens after upload:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• AI automatically extracts supplier, consumption, and cost data</li>
          <li>• Cross-validates usage against your meter readings</li>
          <li>• Compares unit rates with current market tariffs (ARERA)</li>
          <li>• Flags any billing anomalies or unusual consumption patterns</li>
          <li>• Updates your energy dashboard with the latest data</li>
        </ul>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
          
          {uploadedFiles.map((file) => (
            <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{file.name}</h4>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.status === 'processing' && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                  
                  {file.status === 'completed' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Completed</span>
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Error</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {file.extractedData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">Extracted Data</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Supplier:</span>
                      <p className="font-medium">{file.extractedData.supplier}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Period:</span>
                      <p className="font-medium">{file.extractedData.period}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Consumption:</span>
                      <p className="font-medium">{file.extractedData.totalKwh.toLocaleString()} kWh</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Cost:</span>
                      <p className="font-medium">€{file.extractedData.totalCost.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-gray-500 text-sm">Facility:</span>
                    <p className="font-medium">{file.extractedData.facility}</p>
                  </div>

                  {file.extractedData.anomalies && file.extractedData.anomalies.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Anomalies Detected</span>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {file.extractedData.anomalies.map((anomaly, index) => (
                          <li key={index}>• {anomaly}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-3">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Export Data
                    </button>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent Uploads */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analysis</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">23 invoices processed this month</p>
              <p className="text-sm text-gray-500">3 anomalies detected, 2 require attention</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Report
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">€2,450 potential overbilling identified</p>
              <p className="text-sm text-gray-500">Across 3 facilities in November</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceUpload;