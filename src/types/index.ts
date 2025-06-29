export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'upload';
  imageUrl?: string;
}

export interface EnergyAlert {
  id: string;
  type: 'consumption_spike' | 'invoice_discrepancy' | 'delayed_reading' | 'weather_impact';
  severity: 'low' | 'medium' | 'high';
  message: string;
  justification: string;
  externalCorrelation?: string;
  recommendedAction: string;
  timestamp: Date;
  values: {
    current?: number;
    threshold?: number;
    expected?: number;
    actual?: number;
    timeSinceLastReading?: string;
  };
}

export interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'factory' | 'office' | 'retail' | 'warehouse';
  consumption: number;
  cost: number;
  efficiency: number;
  status: 'online' | 'offline' | 'warning';
}

export interface Invoice {
  id: string;
  supplier: string;
  period_start: string;
  period_end: string;
  total_kwh: number;
  unit_cost: number;
  total_due: number;
  facility: string;
  status: 'processed' | 'pending' | 'anomaly_detected';
}

export interface SolarDataPoint {
  month: string;
  energy_generated: number;
  energy_used: number;
  efficiency: number;
  total_cost: number;
  supplier: string;
}

export interface SolarStats {
  totalGenerated: number;
  totalUsed: number;
  totalCost: number;
  avgEfficiency: number;
  monthOverMonthChange: {
    generated: number;
    used: number;
    cost: number;
  };
  latestMonth: SolarDataPoint | null;
}