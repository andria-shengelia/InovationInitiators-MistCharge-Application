import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getSettings } from '../utils/offlineStorage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface NetworkStatusIndicatorProps {
  showFloatingIndicator?: boolean;
  subtleMode?: boolean;
}

export function NetworkStatusIndicator({ 
  showFloatingIndicator: propShowFloating = true,
  subtleMode: propSubtleMode = false 
}: NetworkStatusIndicatorProps) {
  const [settings, setSettings] = useState({
    showIndicator: true,
    subtleMode: propSubtleMode,
    showFloatingIndicator: propShowFloating,
    autoHide: true,
  });
  const insets = useSafeAreaInsets();
  const { 
    networkStatus, 
    isLoading, 
    isOnline, 
    toggleOfflineMode, 
    getStatusColor, 
    getStatusText 
  } = useNetworkStatus();

  const [showDetails, setShowDetails] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const [borderAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await getSettings();
      setSettings({
        showIndicator: storedSettings.showNetworkIndicator ?? true,
        subtleMode: storedSettings.networkIndicatorSubtleMode ?? propSubtleMode,
        showFloatingIndicator: storedSettings.showFloatingIndicator ?? propShowFloating,
        autoHide: storedSettings.autoHideIndicator ?? true,
      });
    } catch (error) {
      console.error('Error loading network indicator settings:', error);
    }
  };

  useEffect(() => {
    // Animate border when status changes
    Animated.timing(borderAnim, {
      toValue: isOnline ? 0 : 1,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Animate floating indicator
    if (!isOnline) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 4 seconds if auto-hide is enabled
      if (settings.autoHide) {
        const timer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: -50,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }, 4000);

        return () => clearTimeout(timer);
      }

      return () => clearTimeout(timer);
    } else {
      // Show "back online" celebration when reconnecting
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for celebration
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();

      // Hide after celebration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, statusColor]);

  const handleToggleOffline = async () => {
    if (networkStatus.isOfflineMode) {
      Alert.alert(
        'Exit Offline Mode',
        'This will attempt to reconnect to the server. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              await toggleOfflineMode();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Enter Offline Mode',
        'This will work with cached data only. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              await toggleOfflineMode();
            },
          },
        ]
      );
    }
  };

  if (isLoading || !settings.showIndicator) {
    return null;
  }

  return (
    <>
      {/* Animated border indicator around the entire app */}
      <Animated.View style={[
        styles.borderIndicator,
        {
          borderColor: statusColor,
          borderWidth: borderAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, settings.subtleMode ? 1 : 2],
          }),
          opacity: borderAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, settings.subtleMode ? 0.3 : 0.6],
          }),
        }
      ]} />

      {/* Floating status indicator */}
      {settings.showFloatingIndicator && (
        <Animated.View
          style={[
            styles.floatingIndicator,
            {
              top: Platform.OS === 'ios' ? insets.top + 5 : insets.top + 10,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.floatingButton,
              { 
                backgroundColor: statusColor + 'F0',
                transform: [{ scale: isOnline ? pulseAnim : 1 }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setShowDetails(!showDetails)}
              activeOpacity={0.8}
              style={styles.touchableContent}
            >
            <View style={styles.statusContent}>
              <View style={[styles.statusDot, { backgroundColor: 'white' }]} />
              <Text style={styles.statusText}>
                {isOnline ? 'Back Online!' : statusText}
              </Text>
              {isOnline ? (
                <Ionicons name="checkmark-circle" size={16} color="white" />
              ) : (
                <Ionicons 
                  name={showDetails ? 'chevron-up' : 'chevron-down'} 
                  size={12} 
                  color="white" 
                />
              )}
                          </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Expanded details - only show when offline */}
          {showDetails && !isOnline && (
            <Animated.View
              style={[
                styles.detailsPanel,
                { backgroundColor: statusColor + 'F0' },
              ]}
            >
              <View style={styles.detailsContent}>
                <Text style={styles.detailsTitle}>Connection Status</Text>
                <Text style={styles.detailsText}>
                  {networkStatus.isOfflineMode 
                    ? 'Working with cached data'
                    : 'No internet connection detected'
                  }
                </Text>
                
                <TouchableOpacity
                  style={styles.offlineToggle}
                  onPress={handleToggleOffline}
                >
                  <Ionicons 
                    name={networkStatus.isOfflineMode ? 'cloud-offline' : 'cloud'} 
                    size={16} 
                    color="white" 
                  />
                  <Text style={styles.offlineToggleText}>
                    {networkStatus.isOfflineMode ? 'Exit Offline' : 'Go Offline'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Subtle corner indicator for online status */}
      {isOnline && !settings.subtleMode && (
        <Animated.View 
          style={[
            styles.cornerIndicator,
            {
              top: Platform.OS === 'ios' ? insets.top + 2 : insets.top + 5,
              right: 15,
              backgroundColor: statusColor,
              opacity: fadeAnim,
            }
          ]}
        >
          <Ionicons name="checkmark" size={8} color="white" />
        </Animated.View>
      )}

      {/* Ultra-subtle top bar indicator for online status */}
      {isOnline && settings.subtleMode && (
        <Animated.View 
          style={[
            styles.topBarIndicator,
            {
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: statusColor,
              opacity: borderAnim,
            }
          ]}
        />
      )}

      {/* Celebration dots when coming back online */}
      {isOnline && (
        <Animated.View style={[styles.celebrationContainer, { opacity: fadeAnim }]}>
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.celebrationDot,
                {
                  backgroundColor: statusColor,
                  left: `${15 + i * 12}%`,
                  animationDelay: `${i * 100}ms`,
                },
              ]}
            />
          ))}
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  borderIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 9999,
  },
  floatingIndicator: {
    position: 'absolute',
    left: 15,
    right: 15,
    zIndex: 10000,
  },
  floatingButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  touchableContent: {
    flex: 1,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailsPanel: {
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsContent: {
    gap: 8,
  },
  detailsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsText: {
    color: 'white',
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 18,
  },
  offlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  offlineToggleText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  cornerIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 9999,
  },
  topBarIndicator: {
    position: 'absolute',
    zIndex: 10000,
  },
  celebrationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? insets.top + 5 : insets.top + 10,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 9998,
  },
  celebrationDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 0,
  },
}); 