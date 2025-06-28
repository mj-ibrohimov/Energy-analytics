import React from 'react';
import { Building2, Zap, TrendingUp, TrendingDown, MoreVertical, AlertTriangle } from 'lucide-react';
import { Facility } from '../types';

const Facilities: React.FC = () => {
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