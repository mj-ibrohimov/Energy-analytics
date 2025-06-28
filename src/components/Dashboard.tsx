import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, DollarSign, Building2, FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Consumption',
      value: '45,670 kWh',
      change: '-8.3%',
      trend: 'down',
      icon: Zap,
      color: 'blue'
    },
    {
      title: 'Monthly Cost',
      value: '€18,450',
      change: '-12.0%',
      trend: 'down',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Active Facilities',
      value: '12',
      change: '+0',
      trend: 'neutral',
      icon: Building2,
      color: 'indigo'
    },
    {
      title: 'Invoices Processed',
      value: '23',
      change: '+4',
      trend: 'up',
      icon: FileText,
      color: 'purple'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Building C consumption spike: 45% above normal',
      facility: 'Manufacturing Unit C',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Invoice discrepancy detected',
      facility: 'Office Complex B',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'info',
      message: 'Meter reading delay',
      facility: 'Warehouse D',
      time: '6 hours ago'
    }
  ];

  const recentInvoices = [
    {
      id: 1,
      supplier: 'ENEL',
      facility: 'Unit A',
      amount: '€2,450',
      status: 'anomaly',
      period: 'Dec 2024'
    },
    {
      id: 2,
      supplier: 'ENI',
      facility: 'Unit B',
      amount: '€1,890',
      status: 'processed',
      period: 'Dec 2024'
    },
    {
      id: 3,
      supplier: 'Edison',
      facility: 'Unit C',
      amount: '€3,120',
      status: 'pending',
      period: 'Dec 2024'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Energy Management Dashboard</h2>
        <p className="text-gray-600 mt-1">Real-time overview of your energy operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                  {stat.trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                3 Active
              </span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${
                  alert.type === 'critical' ? 'bg-red-100' :
                  alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.type === 'critical' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-500">{alert.facility} • {alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
          </div>
          <div className="p-6 space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    invoice.status === 'anomaly' ? 'bg-red-100' :
                    invoice.status === 'processed' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {invoice.status === 'processed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className={`h-4 w-4 ${
                        invoice.status === 'anomaly' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {invoice.supplier} - {invoice.facility}
                    </p>
                    <p className="text-sm text-gray-500">{invoice.period}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{invoice.amount}</p>
                  <p className={`text-xs capitalize ${
                    invoice.status === 'anomaly' ? 'text-red-600' :
                    invoice.status === 'processed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {invoice.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Energy Consumption Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Consumption Trends</h3>
        <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Zap className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <p className="text-gray-600">Interactive chart visualization</p>
            <p className="text-sm text-gray-500">Integration with Chart.js or similar library</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;