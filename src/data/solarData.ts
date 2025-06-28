import { SolarInvoice, SolarUsageData } from '../types';

// Import the solar data
import solarInvoices from '../../monthly_solar_usage_invoices.json';

export const getSolarUsageData = (): SolarUsageData[] => {
  return (solarInvoices as SolarInvoice[]).map(invoice => {
    const data = invoice.extracted_data;
    const item = data.items[0];
    
    return {
      month: new Date(data.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }),
      energy_generated: item.energy_generated_kwh,
      energy_used: item.energy_used_kwh,
      total_cost: data.total_amount,
      efficiency: Math.round((item.energy_used_kwh / item.energy_generated_kwh) * 100),
      supplier: data.supplier_info.company_name
    };
  }).reverse(); // Show most recent first
};

export const getSolarInvoices = (): SolarInvoice[] => {
  return solarInvoices as SolarInvoice[];
};

export const getSolarStats = () => {
  const data = getSolarUsageData();
  
  const totalGenerated = data.reduce((sum, item) => sum + item.energy_generated, 0);
  const totalUsed = data.reduce((sum, item) => sum + item.energy_used, 0);
  const totalCost = data.reduce((sum, item) => sum + item.total_cost, 0);
  const avgEfficiency = Math.round(data.reduce((sum, item) => sum + item.efficiency, 0) / data.length);
  
  const latestMonth = data[0];
  const previousMonth = data[1];
  
  const monthOverMonthChange = previousMonth ? {
    generated: Math.round(((latestMonth.energy_generated - previousMonth.energy_generated) / previousMonth.energy_generated) * 100),
    used: Math.round(((latestMonth.energy_used - previousMonth.energy_used) / previousMonth.energy_used) * 100),
    cost: Math.round(((latestMonth.total_cost - previousMonth.total_cost) / previousMonth.total_cost) * 100)
  } : { generated: 0, used: 0, cost: 0 };

  return {
    totalGenerated,
    totalUsed,
    totalCost,
    avgEfficiency,
    latestMonth,
    monthOverMonthChange,
    totalInvoices: data.length
  };
}; 