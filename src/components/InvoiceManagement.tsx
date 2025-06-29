import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Download, Plus, Search, Filter, Eye, Calendar, DollarSign } from 'lucide-react';
import { apiService } from '../services/api';

interface ProcessedInvoice {
  id: string;
  fileName: string;
  uploadDate: Date;
  supplier: string;
  period: string;
  facility: string;
  consumption: number;
  totalCost: number;
  unitRate: number;
  status: 'processed' | 'anomaly' | 'pending';
  anomalies?: string[];
  fileUrl?: string;
  extractedData?: any;
}

interface AnomalyDetails {
  type: string;
  severity: string;
  description: string;
  recommendation?: string;
}

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<ProcessedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<ProcessedInvoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAnomalyDetails, setShowAnomalyDetails] = useState<string | null>(null);
  const [anomalyDetails, setAnomalyDetails] = useState<AnomalyDetails | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch invoice history from backend
  const fetchInvoiceHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInvoiceHistory();
      console.log('Invoice history response:', response); // Debug log
      
      if (response.success && response.data) {
        // Transform backend data to match our interface
        const transformedInvoices = response.data.invoices?.map((invoice: any) => {
          console.log('Processing invoice:', invoice); // Debug log
          
          const status: 'processed' | 'anomaly' | 'pending' = 
            !invoice.processing_status ? 'pending' :
            invoice.processing_status === 'completed' && invoice.anomalies?.length > 0 ? 'anomaly' :
            invoice.processing_status === 'completed' ? 'processed' : 'pending';
          
          const extractedData = invoice.extracted_data || {};
          const supplier = extractedData.supplier_info || {};
          
          return {
            id: invoice.id || Date.now().toString(),
            fileName: invoice.filename || 'Unknown File',
            uploadDate: new Date(invoice.upload_time || Date.now()),
            supplier: supplier.company_name || 'Unknown Supplier',
            period: extractedData.date || new Date().toISOString().split('T')[0],
            facility: extractedData.facility || 'Energy System',
            consumption: extractedData.total_consumption || 0,
            totalCost: extractedData.total_amount || 0,
            unitRate: extractedData.unit_rate || 0,
            status,
            anomalies: invoice.anomalies || [],
            fileUrl: invoice.filename ? `${apiService.API_BASE_URL}/view/invoice/${invoice.filename}` : undefined,
            extractedData: extractedData
          };
        }) || [];
        
        console.log('Transformed invoices:', transformedInvoices); // Debug log
        setInvoices(transformedInvoices);
      } else {
        console.error('Failed to fetch invoices:', response.error_message);
      }
    } catch (error) {
      console.error('Error fetching invoice history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceHistory();
    
    // Set up periodic refresh
    const interval = setInterval(fetchInvoiceHistory, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create temporary invoice for UI feedback
      const tempInvoice: ProcessedInvoice = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadDate: new Date(),
        supplier: 'Processing...',
        period: 'Processing...',
        facility: 'Processing...',
        consumption: 0,
        totalCost: 0,
        unitRate: 0,
        status: 'pending',
        fileUrl: URL.createObjectURL(file)
      };

      setInvoices(prev => [tempInvoice, ...prev]);
      setShowUploadModal(false);

      try {
        // Upload to backend using API service
        const result = await apiService.uploadInvoice(file);
        console.log('Upload result:', result);

        if (result.success && result.data) {
          // Instead of updating the temporary invoice, fetch the full list
          // This ensures we have the most up-to-date data from the backend
          await fetchInvoiceHistory();
        } else {
          // Update the temporary invoice to show error
          setInvoices(prev => prev.map(inv => 
            inv.id === tempInvoice.id 
              ? {
                  ...inv,
                  status: 'anomaly',
                  supplier: 'Upload Failed',
                  period: 'Error',
                  facility: 'Error',
                  anomalies: [result.error_message || 'Failed to process document']
                }
              : inv
          ));
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        
        // Update invoice to show error
        setInvoices(prev => prev.map(inv => 
          inv.id === tempInvoice.id 
            ? {
                ...inv,
                status: 'anomaly',
                supplier: 'Upload Failed',
                period: 'Error',
                facility: 'Error',
                anomalies: ['Failed to process document']
              }
            : inv
        ));
      }
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await apiService.deleteInvoice(invoiceId);

      if (response.success) {
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      } else {
        console.error('Failed to delete invoice:', response.error_message);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleViewDocument = async (invoice: ProcessedInvoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleStatusClick = (invoice: ProcessedInvoice) => {
    if (invoice.status === 'anomaly' && invoice.anomalies && invoice.anomalies.length > 0) {
      setAnomalyDetails({
        type: 'Processing Anomaly',
        severity: 'medium',
        description: invoice.anomalies.join(', '),
        recommendation: 'Review the document and extracted data for accuracy.'
      });
      setShowAnomalyDetails(invoice.id);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.facility.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-gray-600">Upload, analyze, and manage energy invoices</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Invoice</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="processed">Processed</option>
            <option value="anomaly">Anomaly</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.fileName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.facility}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(invoice.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusClick(invoice)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                        invoice.status === 'processed'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'anomaly'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {invoice.status === 'processed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {invoice.status === 'anomaly' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.uploadDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDocument(invoice)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
            <p className="text-sm text-gray-400 mt-1">Upload an invoice to get started</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Invoice Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Select an invoice document to analyze
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.pages,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select Document
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supports PDF, DOC, PAGES, JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showPreview && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedInvoice(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">File Name:</span>
                    <span className="ml-2 text-gray-900">{selectedInvoice.fileName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Supplier:</span>
                    <span className="ml-2 text-gray-900">{selectedInvoice.supplier}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Period:</span>
                    <span className="ml-2 text-gray-900">{selectedInvoice.period}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="ml-2 text-gray-900">{formatCurrency(selectedInvoice.totalCost)}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.extractedData && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Extracted Data</h4>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedInvoice.extractedData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedInvoice.fileUrl && selectedInvoice.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) && (
                <div className="text-center">
                  <img 
                    src={selectedInvoice.fileUrl} 
                    alt="Document preview" 
                    className="max-w-full h-auto border rounded-lg"
                  />
                </div>
              )}

              {selectedInvoice.fileUrl && !selectedInvoice.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) && (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Document preview not available</p>
                  <p className="text-sm text-gray-400">File type: {selectedInvoice.fileName.split('.').pop()?.toUpperCase()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Details Panel */}
      {showAnomalyDetails && anomalyDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Anomaly Details</h3>
              <button
                onClick={() => {
                  setShowAnomalyDetails(null);
                  setAnomalyDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-gray-900">{anomalyDetails.type}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  anomalyDetails.severity === 'high' ? 'bg-red-100 text-red-800' :
                  anomalyDetails.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {anomalyDetails.severity}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{anomalyDetails.description}</p>
              </div>

              {anomalyDetails.recommendation && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-600">{anomalyDetails.recommendation}</p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAnomalyDetails(null);
                    setAnomalyDetails(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;