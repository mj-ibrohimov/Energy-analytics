// Types for dashboard data
export interface EnergyUsageData {
  date: string;
  consumption: number;
  generation: number;
  cost: number;
}

export interface FacilityData {
  id: string;
  name: string;
  location: string;
  totalConsumption: number;
  totalGeneration: number;
  efficiency: number;
  lastUpdated: string;
}

export interface BillingSummary {
  month: string;
  totalBill: number;
  energyCharges: number;
  demandCharges: number;
  otherCharges: number;
  savings: number;
}

export interface DashboardData {
  energyUsage: EnergyUsageData[];
  facilities: FacilityData[];
  billingSummary: BillingSummary[];
  peakDemandTimes: string[];
  savingsYTD: number;
  totalFacilities: number;
  averageEfficiency: number;
}

// Mock data for the dashboard
export const mockDashboardData: DashboardData = {
  energyUsage: [
    {
      date: '2024-01-01',
      consumption: 1200,
      generation: 800,
      cost: 450.50
    },
    {
      date: '2024-01-02',
      consumption: 1150,
      generation: 850,
      cost: 425.75
    },
    {
      date: '2024-01-03',
      consumption: 1300,
      generation: 750,
      cost: 487.25
    },
    // Add more days as needed
  ],
  
  facilities: [
    {
      id: 'facility-001',
      name: 'Main Office Building',
      location: 'New York, NY',
      totalConsumption: 25000,
      totalGeneration: 15000,
      efficiency: 85.5,
      lastUpdated: '2024-03-15T10:30:00Z'
    },
    {
      id: 'facility-002',
      name: 'Manufacturing Plant',
      location: 'Detroit, MI',
      totalConsumption: 45000,
      totalGeneration: 20000,
      efficiency: 78.3,
      lastUpdated: '2024-03-15T10:30:00Z'
    },
    {
      id: 'facility-003',
      name: 'Distribution Center',
      location: 'Chicago, IL',
      totalConsumption: 30000,
      totalGeneration: 18000,
      efficiency: 82.7,
      lastUpdated: '2024-03-15T10:30:00Z'
    }
  ],
  
  billingSummary: [
    {
      month: 'January 2024',
      totalBill: 12500.75,
      energyCharges: 8750.50,
      demandCharges: 2500.25,
      otherCharges: 1250.00,
      savings: 1875.50
    },
    {
      month: 'February 2024',
      totalBill: 11750.25,
      energyCharges: 8225.75,
      demandCharges: 2325.50,
      otherCharges: 1199.00,
      savings: 2100.75
    },
    {
      month: 'March 2024',
      totalBill: 13250.50,
      energyCharges: 9275.25,
      demandCharges: 2675.25,
      otherCharges: 1300.00,
      savings: 1650.25
    }
  ],
  
  peakDemandTimes: [
    '08:00-10:00',
    '13:00-15:00',
    '18:00-20:00'
  ],
  
  savingsYTD: 5626.50,
  totalFacilities: 3,
  averageEfficiency: 82.17
};

// Helper functions to get specific data
export const getEnergyUsageData = () => mockDashboardData.energyUsage;
export const getFacilitiesData = () => mockDashboardData.facilities;
export const getBillingSummary = () => mockDashboardData.billingSummary;
export const getPeakDemandTimes = () => mockDashboardData.peakDemandTimes;
export const getDashboardSummary = () => ({
  savingsYTD: mockDashboardData.savingsYTD,
  totalFacilities: mockDashboardData.totalFacilities,
  averageEfficiency: mockDashboardData.averageEfficiency
});

// Function to get data for a specific facility
export const getFacilityById = (facilityId: string) => 
  mockDashboardData.facilities.find(facility => facility.id === facilityId);

// Function to get energy usage for a date range
export const getEnergyUsageForDateRange = (startDate: string, endDate: string) => 
  mockDashboardData.energyUsage.filter(usage => 
    usage.date >= startDate && usage.date <= endDate
  );

// Function to calculate total savings
export const getTotalSavings = () => 
  mockDashboardData.billingSummary.reduce((total, bill) => total + bill.savings, 0);

// Function to get efficiency trends
export const getEfficiencyTrend = () => 
  mockDashboardData.facilities.map(facility => ({
    facilityName: facility.name,
    efficiency: facility.efficiency
  })); 