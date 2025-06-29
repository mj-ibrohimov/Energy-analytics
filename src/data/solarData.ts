import { SolarDataPoint, SolarStats } from '../types';

// Import the solar data
import solarInvoices from '../../monthly_solar_usage_invoices.json';

export const getSolarUsageData = (): SolarDataPoint[] => [
  {
    month: 'Jan 2024',
    energy_generated: 1200,
    energy_used: 980,
    efficiency: 82,
    total_cost: 245.50,
    supplier: 'SolarCo Energy, New York'
  },
  {
    month: 'Feb 2024',
    energy_generated: 1150,
    energy_used: 920,
    efficiency: 80,
    total_cost: 230.25,
    supplier: 'SolarCo Energy, New York'
  },
  {
    month: 'Mar 2024',
    energy_generated: 1300,
    energy_used: 1040,
    efficiency: 78,
    total_cost: 260.75,
    supplier: 'SolarCo Energy, New York'
  },
  {
    month: 'Apr 2024',
    energy_generated: 1400,
    energy_used: 1120,
    efficiency: 85,
    total_cost: 280.00,
    supplier: 'SolarCo Energy, New York'
  },
  {
    month: 'May 2024',
    energy_generated: 1500,
    energy_used: 1200,
    efficiency: 83,
    total_cost: 300.50,
    supplier: 'SolarCo Energy, New York'
  }
];

export const getSolarInvoices = (): SolarInvoice[] => {
  return solarInvoices as SolarInvoice[];
};

export const getSolarStats = (): SolarStats => {
  const data = getSolarUsageData();
  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];

  const totalGenerated = data.reduce((sum, month) => sum + month.energy_generated, 0);
  const totalUsed = data.reduce((sum, month) => sum + month.energy_used, 0);
  const totalCost = data.reduce((sum, month) => sum + month.total_cost, 0);
  const avgEfficiency = Math.round(
    data.reduce((sum, month) => sum + month.efficiency, 0) / data.length
  );

  // Calculate month-over-month changes
  const monthOverMonthChange = {
    generated: Math.round(
      ((currentMonth.energy_generated - previousMonth.energy_generated) / previousMonth.energy_generated) * 100
    ),
    used: Math.round(
      ((currentMonth.energy_used - previousMonth.energy_used) / previousMonth.energy_used) * 100
    ),
    cost: Math.round(
      ((currentMonth.total_cost - previousMonth.total_cost) / previousMonth.total_cost) * 100
    )
  };

  return {
    totalGenerated,
    totalUsed,
    totalCost,
    avgEfficiency,
    monthOverMonthChange,
    latestMonth: currentMonth
  };
}; 