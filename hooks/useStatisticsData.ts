import { useState, useEffect } from 'react';

interface StatisticsData {
  summary: {
    totalWater: number;
    waterChange: number;
    dailyAverage: number;
    avgChange: number;
    avgTemperature: number;
    tempChange: number;
    avgBattery: number;
    batteryChange: number;
  };
  chartData: Array<{
    date: string;
    amount: number;
    temperature: number;
    humidity: number;
  }>;
}

export function useStatisticsData(period: '7' | '30') {
  const [data, setData] = useState<StatisticsData>({
    summary: {
      totalWater: 0,
      waterChange: 0,
      dailyAverage: 0,
      avgChange: 0,
      avgTemperature: 0,
      tempChange: 0,
      avgBattery: 0,
      batteryChange: 0,
    },
    chartData: [],
  });
  const [loading, setLoading] = useState(false);

  const generateMockData = (days: number): StatisticsData => {
    const chartData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic data with some patterns
      const baseAmount = 2.5;
      const seasonalVariation = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.5;
      const weekendBonus = (date.getDay() === 0 || date.getDay() === 6) ? 0.3 : 0;
      const randomVariation = (Math.random() - 0.5) * 1.0;
      
      const amount = Math.max(0.1, baseAmount + seasonalVariation + weekendBonus + randomVariation);
      const temperature = 20 + Math.sin((date.getMonth() / 12) * Math.PI * 2) * 8 + (Math.random() - 0.5) * 4;
      const humidity = 70 + Math.sin((date.getMonth() / 12) * Math.PI * 2) * 15 + (Math.random() - 0.5) * 10;
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        amount: Math.round(amount * 10) / 10,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity),
      });
    }

    const totalWater = chartData.reduce((sum, item) => sum + item.amount, 0);
    const dailyAverage = totalWater / days;
    const avgTemperature = chartData.reduce((sum, item) => sum + item.temperature, 0) / days;
    const avgBattery = 85 + (Math.random() - 0.5) * 10;

    return {
      summary: {
        totalWater: Math.round(totalWater * 10) / 10,
        waterChange: Math.round((Math.random() * 10 + 5) * 10) / 10,
        dailyAverage: Math.round(dailyAverage * 10) / 10,
        avgChange: Math.round((Math.random() * 8 + 2) * 10) / 10,
        avgTemperature: Math.round(avgTemperature * 10) / 10,
        tempChange: Math.round((Math.random() * 6 + 1) * 10) / 10,
        avgBattery: Math.round(avgBattery),
        batteryChange: Math.round((Math.random() * 5 + 1) * 10) / 10,
      },
      chartData,
    };
  };

  const fetchStatistics = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would fetch from your backend API:
      // const response = await fetch(`/api/stats?days=${period}`);
      // const data = await response.json();
      
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const mockData = generateMockData(parseInt(period));
      setData(mockData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Fallback to mock data
      const mockData = generateMockData(parseInt(period));
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchStatistics();
  };

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  return { data, loading, refreshData };
}