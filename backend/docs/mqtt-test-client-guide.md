# AWS IoT Core MQTT Test Client Guide

## Setup Instructions

### 1. Access MQTT Test Client
- Go to AWS Console → IoT Core → Test → MQTT test client
- URL: https://console.aws.amazon.com/iot/home#/test

### 2. Subscribe to Topics (to see responses)

#### Subscribe to Command Responses:
- **Topic**: `mistcharge/commands/+/response`
- **QoS**: 0

#### Subscribe to Device Status:
- **Topic**: `mistcharge/device/status`
- **QoS**: 0

### 3. Send Commands

#### Command 1: Calibrate Sensors
- **Topic**: `mistcharge/commands/calibrate`
- **Message**:
```json
{
  "command": "calibrate",
  "parameters": {
    "sensors": ["temperature", "humidity", "water_level"],
    "duration": 30
  },
  "timestamp": "2025-08-02T22:30:00Z"
}
```

#### Command 2: Restart Device
- **Topic**: `mistcharge/commands/restart`
- **Message**:
```json
{
  "command": "restart",
  "parameters": {
    "delay": 5,
    "reason": "maintenance"
  },
  "timestamp": "2025-08-02T22:30:00Z"
}
```

#### Command 3: Set Operating Mode
- **Topic**: `mistcharge/commands/set_mode`
- **Message**:
```json
{
  "command": "set_mode",
  "parameters": {
    "mode": "high_efficiency",
    "target_humidity": 75,
    "target_temperature": 25
  },
  "timestamp": "2025-08-02T22:30:00Z"
}
```

#### Command 4: Emergency Stop
- **Topic**: `mistcharge/commands/emergency_stop`
- **Message**:
```json
{
  "command": "emergency_stop",
  "parameters": {
    "reason": "safety_check",
    "immediate": true
  },
  "timestamp": "2025-08-02T22:30:00Z"
}
```

### 4. Send Sensor Data (for testing)

#### Temperature Reading:
- **Topic**: `mistcharge/sensors/temperature`
- **Message**:
```json
{
  "value": 25.5,
  "timestamp": "2025-08-02T22:30:00Z",
  "location": "outdoor_unit_1",
  "accuracy": 0.1
}
```

#### Humidity Reading:
- **Topic**: `mistcharge/sensors/humidity`
- **Message**:
```json
{
  "value": 82.3,
  "timestamp": "2025-08-02T22:30:00Z",
  "location": "outdoor_unit_1",
  "accuracy": 0.5
}
```

#### Water Level Reading:
- **Topic**: `mistcharge/sensors/water_level`
- **Message**:
```json
{
  "value": 2.8,
  "timestamp": "2025-08-02T22:30:00Z",
  "location": "storage_tank_1",
  "unit": "liters"
}
```

#### Daily Water Production:
- **Topic**: `mistcharge/sensors/water_produced`
- **Message**:
```json
{
  "daily_production": 2.1,
  "date": "2025-08-02",
  "timestamp": "2025-08-02T22:30:00Z",
  "location": "outdoor_unit_1",
  "efficiency": 85.5
}
```

### 5. Monitor Responses

After sending commands, check:
1. **Your server logs** - Should show command received
2. **Database** - Commands should be stored
3. **Frontend** - Should update with new sensor data
4. **MQTT Test Client** - Subscribe to response topics

### 6. Testing Sequence

1. **Send sensor data** → Check if frontend updates
2. **Send commands** → Check server logs
3. **Monitor database** → Verify data storage
4. **Check frontend** → See real-time updates

## Troubleshooting

### If commands don't work:
1. Check if your server is running
2. Verify MQTT connection status
3. Check server logs for errors
4. Ensure topic names match exactly

### If sensor data doesn't update:
1. Check API endpoint connectivity
2. Verify database connection
3. Check frontend console for errors
4. Ensure data format is correct 