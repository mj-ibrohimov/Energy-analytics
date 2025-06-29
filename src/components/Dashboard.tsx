import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, DollarSign, Building2, FileText, Sun } from 'lucide-react';
import { getSolarStats, getSolarUsageData } from '../data/solarData';

const Dashboard: React.FC = () => {
  const solarStats = getSolarStats();
  const solarData = getSolarUsageData();

  const stats = [
    {
      title: 'Total Energy Generated',
      value: `${solarStats.totalGenerated.toLocaleString()} kWh`,
      change: `${solarStats.monthOverMonthChange.generated > 0 ? '+' : ''}${solarStats.monthOverMonthChange.generated}%`,
      trend: solarStats.monthOverMonthChange.generated >= 0 ? 'up' : 'down',
      icon: Sun,
      color: 'yellow'
    },
    {
      title: 'Total Energy Used',
      value: `${solarStats.totalUsed.toLocaleString()} kWh`,
      change: `${solarStats.monthOverMonthChange.used > 0 ? '+' : ''}${solarStats.monthOverMonthChange.used}%`,
      trend: solarStats.monthOverMonthChange.used >= 0 ? 'up' : 'down',
      icon: Zap,
      color: 'blue'
    },
    {
      title: 'Total Cost',
      value: `$${solarStats.totalCost.toFixed(2)}`,
      change: `${solarStats.monthOverMonthChange.cost > 0 ? '+' : ''}${solarStats.monthOverMonthChange.cost}%`,
      trend: solarStats.monthOverMonthChange.cost <= 0 ? 'down' : 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Average Efficiency',
      value: `${solarStats.avgEfficiency}%`,
      change: 'vs last month',
      trend: 'neutral',
      icon: Building2,
      color: 'purple'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'info',
      message: `Latest invoice processed: ${solarStats.latestMonth?.month}`,
      facility: 'Home Solar System',
      time: 'Today'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Efficiency below 80% in recent months',
      facility: 'Solar Panel Array',
      time: '2 days ago'
    },
    {
      id: 3,
      type: 'info',
      message: 'Payment due: $67.32',
      facility: 'Solar Energy Bill',
      time: '5 days ago'
    }
  ];

  const recentInvoices = solarData.slice(0, 3).map((item, index) => ({
    id: index + 1,
    supplier: item.supplier.split(',')[0], // Get company name only
    facility: 'Home Solar',
    amount: `$${item.total_cost.toFixed(2)}`,
    status: item.efficiency >= 80 ? 'processed' : 'anomaly',
    period: item.month
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Solar Energy Dashboard</h2>
        <p className="text-gray-600 mt-1">Real-time overview of your solar panel energy operations</p>
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
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {alerts.length} Active
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

      {/* Monthly Usage Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Energy Usage</h3>
        <div className="space-y-3">
          {solarData.map((month, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900 w-16">{month.month}</div>
                <div className="text-sm text-gray-500">
                  Generated: {month.energy_generated.toFixed(0)} kWh
                </div>
                <div className="text-sm text-gray-500">
                  Used: {month.energy_used.toFixed(0)} kWh
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Efficiency: {month.efficiency}%
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  ${month.total_cost.toFixed(2)}
                </div>
              </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;