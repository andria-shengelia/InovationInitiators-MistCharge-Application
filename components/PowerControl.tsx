import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { POWER, BACKGROUND, TEXT, SHADOW } from '@/constants/colors';

interface PowerControlProps {
  isOn: boolean;
  onToggle: (newState: boolean) => void;
}

export function PowerControl({ isOn, onToggle }: PowerControlProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(!isOn);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle power state');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Power Control</Text>
        <Text style={styles.subtitle}>Machine ON/OFF</Text>
      </View>
      
      <View style={styles.controlContainer}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: isOn ? POWER.ON : POWER.OFF }]} />
          <Text style={styles.statusText}>
            {isOn ? 'RUNNING' : 'STOPPED'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.powerButton,
            { backgroundColor: isOn ? POWER.OFF : POWER.ON }
          ]}
          onPress={handleToggle}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.powerButtonText}>
              {isOn ? 'TURN OFF' : 'TURN ON'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {isOn 
            ? 'Machine is currently running and generating water'
            : 'Machine is stopped. Turn on to start water generation'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.CARD,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: SHADOW.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT.PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT.SECONDARY,
    fontWeight: '500',
  },
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT.PRIMARY,
  },
  powerButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  powerButtonText: {
    color: THEME.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: BACKGROUND.POWER_INFO,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: TEXT.SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 