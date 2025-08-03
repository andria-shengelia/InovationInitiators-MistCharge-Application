import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface MonthlyChartProps {
  data: Array<{ date: string; amount: number; temperature: number; humidity: number }>;
  period: '7' | '30';
}

export function MonthlyChart({ data, period }: MonthlyChartProps) {
  const maxAmount = Math.max(...data.map(d => d.amount));
  const chartWidth = width - 80; // Account for margins and padding
  const barWidth = Math.max(8, (chartWidth - (data.length * 4)) / data.length);

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{maxAmount.toFixed(1)}L</Text>
          <Text style={styles.yAxisLabel}>{(maxAmount * 0.75).toFixed(1)}L</Text>
          <Text style={styles.yAxisLabel}>{(maxAmount * 0.5).toFixed(1)}L</Text>
          <Text style={styles.yAxisLabel}>{(maxAmount * 0.25).toFixed(1)}L</Text>
          <Text style={styles.yAxisLabel}>0L</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chartScrollView}>
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const barHeight = (item.amount / maxAmount) * 160;
              const isWeekend = new Date(item.date).getDay() === 0 || new Date(item.date).getDay() === 6;
              
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: Math.max(2, barHeight),
                          width: barWidth,
                          backgroundColor: isWeekend ? '#06b6d4' : '#3b82f6',
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.dateLabel}>
                    {period === '7' 
                      ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
                      : new Date(item.date).getDate()
                    }
                  </Text>
                  <Text style={styles.amountLabel}>{item.amount.toFixed(1)}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Chart Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Weekday</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#06b6d4' }]} />
          <Text style={styles.legendText}>Weekend</Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Collection</Text>
          <Text style={styles.summaryValue}>
            {data.reduce((sum, item) => sum + item.amount, 0).toFixed(1)}L
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Best Day</Text>
          <Text style={styles.summaryValue}>
            {Math.max(...data.map(d => d.amount)).toFixed(1)}L
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Avg Humidity</Text>
          <Text style={styles.summaryValue}>
            {(data.reduce((sum, item) => sum + item.humidity, 0) / data.length).toFixed(0)}%
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Avg Temp</Text>
          <Text style={styles.summaryValue}>
            {(data.reduce((sum, item) => sum + item.temperature, 0) / data.length).toFixed(1)}°C
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 180,
    marginRight: 12,
    paddingTop: 10,
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  chartScrollView: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 10,
    gap: 2,
  },
  barColumn: {
    alignItems: 'center',
    minWidth: 24,
  },
  barContainer: {
    height: 160,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 2,
    minHeight: 2,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  amountLabel: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
});