import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Download, Plus, Search, Filter, Eye, Calendar, DollarSign } from 'lucide-react';
import { getSolarInvoices } from '../data/solarData';

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
}

const InvoiceManagement: React.FC = () => {
  const solarInvoices = getSolarInvoices();
  
  const [invoices, setInvoices] = useState<ProcessedInvoice[]>(
    solarInvoices.map((invoice, index) => {
      const data = invoice.extracted_data;
      const item = data.items[0];
      const efficiency = Math.round((item.energy_used_kwh / item.energy_generated_kwh) * 100);
      
      return {
        id: (index + 1).toString(),
        fileName: `${data.invoice_number}.pdf`,
        uploadDate: new Date(data.date),
        supplier: data.supplier_info.company_name,
        period: new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        facility: 'Home Solar System',
        consumption: item.energy_generated_kwh,
        totalCost: data.total_amount,
        unitRate: item.unit_price_usd_per_kwh,
        status: efficiency >= 80 ? 'processed' as const : 'anomaly' as const,
        anomalies: efficiency < 80 ? ['Efficiency below optimal target'] : undefined,
        fileUrl: '#' // In a real app, this would be a URL to the actual file
      };
    }).reverse() // Show most recent first
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<ProcessedInvoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAnomalyDetails, setShowAnomalyDetails] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Simulate processing
      const newInvoice: ProcessedInvoice = {
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

      setInvoices(prev => [newInvoice, ...prev]);
      setShowUploadModal(false);

      // Simulate AI processing
      setTimeout(() => {
        setInvoices(prev => prev.map(inv => 
          inv.id === newInvoice.id 
            ? {
                ...inv,
                supplier: 'SHENZHEN SUNPOWER ENERGY CO., LTD.',
                period: 'July 2025',
                facility: 'Home Solar System',
                consumption: Math.floor(Math.random() * 500) + 300,
                totalCost: Math.floor(Math.random() * 100) + 30,
                unitRate: 0.15,
                status: Math.random() > 0.7 ? 'anomaly' : 'processed',
                anomalies: Math.random() > 0.7 ? ['Efficiency variance detected', 'Unusual consumption pattern'] : undefined
              }
            : inv
        ));
      }, 3000);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.facility.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-green-600 bg-green-100';
      case 'anomaly': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>;
      default: return null;
    }
  };

  const totalInvoices = invoices.length;
  const processedInvoices = invoices.filter(inv => inv.status === 'processed').length;
  const anomalyInvoices = invoices.filter(inv => inv.status === 'anomaly').length;
  const totalCost = invoices.reduce((sum, inv) => sum + inv.totalCost, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solar Invoice Management</h2>
          <p className="text-gray-600 mt-1">Manage and analyze all solar energy invoices with AI-powered processing</p>
        </div>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Invoice</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Processed</p>
              <p className="text-2xl font-bold text-green-600">{processedInvoices}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Anomalies</p>
              <p className="text-2xl font-bold text-red-600">{anomalyInvoices}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="processed">Processed</option>
              <option value="anomaly">Anomaly</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Energy (kWh)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                    <button 
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowPreview(true);
                      }}
                      className="flex items-center hover:text-blue-600"
                    >
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.fileName}</div>
                        <div className="text-sm text-gray-500">{invoice.facility}</div>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.period}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.consumption.toFixed(0)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${invoice.totalCost.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setShowAnomalyDetails(showAnomalyDetails === invoice.id ? null : invoice.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
                    >
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1 capitalize">{invoice.status.replace('_', ' ')}</span>
                    </button>
                    {showAnomalyDetails === invoice.id && invoice.anomalies && (
                      <div className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-64">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Detected Anomalies:</h4>
                        <ul className="space-y-1">
                          {invoice.anomalies.map((anomaly, index) => (
                            <li key={index} className="text-sm text-red-600 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {anomaly}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => window.open(invoice.fileUrl, '_blank')}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedInvoice.fileName}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(selectedInvoice.fileUrl, '_blank')}
                  className="text-green-600 hover:text-green-900"
                >
                  <Download className="h-5 w-5" />
                </button>
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
            </div>

            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
              {selectedInvoice.fileUrl && (
                <iframe
                  src={selectedInvoice.fileUrl}
                  className="w-full h-full"
                  title={selectedInvoice.fileName}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;