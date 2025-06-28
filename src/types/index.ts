export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'upload' | 'alert' | 'analysis';
}

export interface EnergyAlert {
  id: string;
  type: 'billing_anomaly' | 'consumption_spike' | 'efficiency_warning' | 'invoice_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  facility: string;
  timestamp: Date;
  value?: number;
  threshold?: number;
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