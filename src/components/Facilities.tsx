import { Building2, Zap, TrendingUp, TrendingDown, MoreVertical, AlertTriangle, Sun } from 'lucide-react';
import { Facility, EnergyAlert } from '../types';
import { getSolarUsageData, getSolarStats } from '../data/solarData';
import { useEffect, useState } from 'react';

const Facilities: React.FC = () => {
  const solarData = getSolarUsageData();
  const solarStats = getSolarStats();
  const [alerts, setAlerts] = useState<EnergyAlert[]>([]);

  useEffect(() => {
    generateAlerts();
  }, [solarData]);

  const generateAlerts = () => {
    const newAlerts: EnergyAlert[] = [];
    const latestData = solarData[0];
    const last3Months = solarData.slice(0, 3);
    
    // Calculate averages
    const avgUsage = last3Months.reduce((sum, month) => sum + month.energy_used, 0) / last3Months.length;
    const avgCost = last3Months.reduce((sum, month) => sum + month.total_cost, 0) / last3Months.length;
    
    // 1. Consumption Spike Check
    if (latestData.energy_used > avgUsage * 1.3) {
      newAlerts.push({
        id: 'spike-' + Date.now(),
        type: 'consumption_spike',
        severity: 'high',
        message: 'Unusual energy consumption detected',
        justification: `Current usage is ${Math.round((latestData.energy_used/avgUsage - 1) * 100)}% above recent average`,
        recommendedAction: 'Review energy usage patterns and check for equipment malfunctions',
        timestamp: new Date(),
        values: {
          current: latestData.energy_used,
          threshold: avgUsage * 1.3,
          actual: latestData.energy_used,
          expected: avgUsage
        }
      });
    }

    // 2. Invoice Discrepancy Check
    const expectedCost = (latestData.energy_used * solarData[1].total_cost) / solarData[1].energy_used;
    if (Math.abs(latestData.total_cost - expectedCost) > expectedCost * 0.1) {
      newAlerts.push({
        id: 'invoice-' + Date.now(),
        type: 'invoice_discrepancy',
        severity: 'medium',
        message: 'Invoice amount shows unexpected variation',
        justification: `Invoice total deviates ${Math.round(Math.abs(latestData.total_cost - expectedCost) / expectedCost * 100)}% from expected cost`,
        recommendedAction: 'Review recent rate changes and verify billing calculations',
        timestamp: new Date(),
        values: {
          actual: latestData.total_cost,
          expected: expectedCost,
          threshold: expectedCost * 0.1
        }
      });
    }

    // 3. Efficiency Warning
    if (latestData.efficiency < 70) {
      newAlerts.push({
        id: 'efficiency-' + Date.now(),
        type: 'weather_impact',
        severity: 'medium',
        message: 'Solar panel efficiency below optimal levels',
        justification: `Current efficiency at ${latestData.efficiency}%, below target of 70%`,
        externalCorrelation: 'May be affected by seasonal weather patterns',
        recommendedAction: 'Schedule panel inspection and cleaning',
        timestamp: new Date(),
        values: {
          current: latestData.efficiency,
          threshold: 70
        }
      });
    }

    setAlerts(newAlerts);
  };

  const facilities: Facility[] = [
    {
      id: '1',
      name: 'Manufacturing Unit A',
      type: 'factory',
      consumption: 18450,
      cost: 8900,
      efficiency: 87,
      status: 'online'
    },
    {
      id: '2',
      name: 'Data Center B',
      type: 'office',
      consumption: 12330,
      cost: 4200,
      efficiency: 92,
      status: 'online'
    },
    {
      id: '3',
      name: 'Office Complex C',
      type: 'office',
      consumption: 8890,
      cost: 3800,
      efficiency: 78,
      status: 'warning'
    },
    {
      id: '4',
      name: 'Warehouse D',
      type: 'warehouse',
      consumption: 4200,
      cost: 1550,
      efficiency: 95,
      status: 'online'
    },
    {
      id: '5',
      name: 'Hospital Complex E',
      type: 'hospital',
      consumption: 15600,
      cost: 7200,
      efficiency: 89,
      status: 'online'
    },
    {
      id: '6',
      name: 'Retail Center F',
      type: 'retail',
      consumption: 6800,
      cost: 2800,
      efficiency: 83,
      status: 'offline'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'factory': return '🏭';
      case 'hospital': return '🏥';
      case 'office': return '🏢';
      case 'retail': return '🏬';
      case 'warehouse': return '🏪';
      default: return '🏢';
    }
  };

  const getEfficiencyTrend = (efficiency: number) => {
    if (efficiency >= 90) return { icon: TrendingUp, color: 'text-green-600', label: 'Excellent' };
    if (efficiency >= 80) return { icon: TrendingUp, color: 'text-blue-600', label: 'Good' };
    return { icon: TrendingDown, color: 'text-yellow-600', label: 'Needs Attention' };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Facility Management</h2>
          <p className="text-gray-600 mt-1">Monitor energy consumption across all facilities</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-500">Total Facilities:</span>
            <span className="font-semibold text-gray-900 ml-2">{facilities.length}</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add Facility
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Consumption</p>
              <p className="text-2xl font-bold text-gray-900">66,270 kWh</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">€28,450</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alert System */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {alerts.length} Active
            </span>
          </div>
          
          <div className="space-y-4">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="ml-3 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${
                        alert.severity === 'high' ? 'text-red-800' :
                        alert.severity === 'medium' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {alert.message}
                      </h3>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p className={
                        alert.severity === 'high' ? 'text-red-700' :
                        alert.severity === 'medium' ? 'text-yellow-700' :
                        'text-blue-700'
                      }>
                        {alert.justification}
                      </p>
                      {alert.externalCorrelation && (
                        <p className="mt-1 text-gray-600">
                          {alert.externalCorrelation}
                        </p>
                      )}
                      <p className="mt-2 font-medium">
                        Recommended Action: {alert.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {facilities.map((facility) => {
          const trend = getEfficiencyTrend(facility.efficiency);
          const TrendIcon = trend.icon;
          
          return (
            <div key={facility.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(facility.type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(facility.status)}`}>
                      {facility.status}
                    </span>
                  </div>
                </div>
                
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Consumption</span>
                  <span className="font-semibold text-gray-900">{facility.consumption.toLocaleString()} kWh</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Monthly Cost</span>
                  <span className="font-semibold text-gray-900">€{facility.cost.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Efficiency</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{facility.efficiency}%</span>
                    <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                  </div>
                </div>

                {facility.status === 'warning' && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">Consumption spike detected</span>
                  </div>
                )}

                {facility.status === 'offline' && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">Connection lost</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Facilities;