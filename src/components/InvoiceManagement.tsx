import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Download, Plus, Search, Filter, Eye, Calendar, DollarSign } from 'lucide-react';

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
}

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<ProcessedInvoice[]>([
    {
      id: '1',
      fileName: 'ENEL_Nov2024_UnitA.pdf',
      uploadDate: new Date('2024-12-01'),
      supplier: 'ENEL S.p.A.',
      period: 'November 2024',
      facility: 'Manufacturing Unit A',
      consumption: 2847,
      totalCost: 1245.80,
      unitRate: 0.142,
      status: 'anomaly',
      anomalies: ['Unit rate 8% above market average']
    },
    {
      id: '2',
      fileName: 'ENI_Nov2024_UnitB.pdf',
      uploadDate: new Date('2024-12-02'),
      supplier: 'ENI Gas e Luce',
      period: 'November 2024',
      facility: 'Office Complex B',
      consumption: 1456,
      totalCost: 678.90,
      unitRate: 0.135,
      status: 'processed'
    },
    {
      id: '3',
      fileName: 'Edison_Nov2024_UnitC.pdf',
      uploadDate: new Date('2024-12-03'),
      supplier: 'Edison Energia',
      period: 'November 2024',
      facility: 'Data Center C',
      consumption: 3421,
      totalCost: 1567.45,
      unitRate: 0.138,
      status: 'processed'
    },
    {
      id: '4',
      fileName: 'ACEA_Nov2024_UnitD.pdf',
      uploadDate: new Date('2024-12-04'),
      supplier: 'ACEA Energia',
      period: 'November 2024',
      facility: 'Warehouse D',
      consumption: 892,
      totalCost: 423.67,
      unitRate: 0.145,
      status: 'anomaly',
      anomalies: ['Consumption spike detected', 'Weekend usage 40% above normal']
    },
    {
      id: '5',
      fileName: 'Hera_Nov2024_UnitE.pdf',
      uploadDate: new Date('2024-12-05'),
      supplier: 'Hera Comm',
      period: 'November 2024',
      facility: 'Hospital Complex E',
      consumption: 4567,
      totalCost: 2134.89,
      unitRate: 0.133,
      status: 'processed'
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        status: 'pending'
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setShowUploadModal(false);

      // Simulate AI processing
      setTimeout(() => {
        setInvoices(prev => prev.map(inv => 
          inv.id === newInvoice.id 
            ? {
                ...inv,
                supplier: 'ENEL S.p.A.',
                period: 'December 2024',
                facility: 'Manufacturing Unit A',
                consumption: Math.floor(Math.random() * 3000) + 1000,
                totalCost: Math.floor(Math.random() * 1500) + 500,
                unitRate: 0.140 + Math.random() * 0.02,
                status: Math.random() > 0.7 ? 'anomaly' : 'processed',
                anomalies: Math.random() > 0.7 ? ['Rate variance detected'] : undefined
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
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-gray-600 mt-1">Manage and analyze all energy invoices with AI-powered processing</p>
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
              <p className="text-2xl font-bold text-gray-900">€{totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices by filename, supplier, or facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="processed">Processed</option>
              <option value="anomaly">Anomalies</option>
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
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumption
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
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.fileName}</div>
                        <div className="text-sm text-gray-500">{invoice.period}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.supplier}</div>
                    <div className="text-sm text-gray-500">€{invoice.unitRate.toFixed(3)}/kWh</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.facility}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.consumption.toLocaleString()} kWh
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{invoice.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1">{invoice.status}</span>
                    </span>
                    {invoice.anomalies && invoice.anomalies.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-red-600">
                          {invoice.anomalies.length} anomal{invoice.anomalies.length === 1 ? 'y' : 'ies'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
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
              <h3 className="text-lg font-semibold text-gray-900">Upload Invoice Image</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">AI Processing includes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Automatic data extraction from invoice images</li>
                  <li>• Cross-validation with meter readings</li>
                  <li>• Market rate comparison (ARERA database)</li>
                  <li>• Anomaly detection and billing validation</li>
                  <li>• Integration with scraping functions for real-time data</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Select an invoice image to process
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select Image from Device
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Supports JPG, PNG, PDF up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;