# 📡 MQTT Publish Guide - Mist Charge IoT

## 🎯 Overview
This guide contains all the MQTT publish commands you can use to interact with your Mist Charge IoT system. Use these commands in the AWS IoT Core MQTT Test Client or any MQTT client.

## 🔧 AWS IoT Core MQTT Test Client Setup

1. **Go to AWS Console**: https://console.aws.amazon.com/iot/home#/test
2. **Click "Test" → "MQTT test client"**
3. **Select "Publish"** to send commands
4. **Use the topics and messages below**

---

## 🌡️ **Sensor Data Publishing**

### **Temperature Sensor**
- **Topic**: `mistcharge/sensors/temperature`
- **Message**:
```json
{
  "value": 25.8,
  "timestamp": "2025-08-03T22:35:00Z",
  "location": "outdoor_unit_1",
  "accuracy": 0.1,
  "unit": "celsius"
}
```

### **Humidity Sensor**
- **Topic**: `mistcharge/sensors/humidity`
- **Message**:
```json
{
  "value": 78.5,
  "timestamp": "2025-08-03T22:35:00Z",
  "location": "outdoor_unit_1",
  "accuracy": 0.5,
  "unit": "percentage"
}
```

### **Water Level Sensor**
- **Topic**: `mistcharge/sensors/water_level`
- **Message**:
```json
{
  "value": 3.2,
  "timestamp": "2025-08-03T22:35:00Z",
  "location": "storage_tank_1",
  "unit": "liters"
}
```

### **Battery Level Sensor**
- **Topic**: `mistcharge/sensors/battery`
- **Message**:
```json
{
  "value": 92.0,
  "timestamp": "2025-08-03T22:35:00Z",
  "location": "main_unit",
  "unit": "percentage"
}
```

### **Water Quality Sensor**
- **Topic**: `mistcharge/sensors/water_quality`
- **Message**:
```json
{
  "value": 1,
  "timestamp": "2025-08-03T22:35:00Z",
  "location": "water_tank",
  "status": "safe"
}
```

### **Daily Water Production**
- **Topic**: `mistcharge/sensors/water_produced`
- **Message**:
```json
{
  "daily_production": 15.5,
  "date": "2025-08-03",
  "timestamp": "2025-08-03T22:35:00Z",
  "unit": "liters"
}
```

---

## 🎛️ **Command Publishing**

### **Power Control**

#### **Turn Machine ON**
- **Topic**: `mistcharge/commands/power_on`
- **Message**:
```json
{
  "command": "power_on",
  "timestamp": "2025-08-03T22:35:00Z",
  "source": "aws_console",
  "parameters": {
    "reason": "manual_activation",
    "user": "admin"
  }
}
```

#### **Turn Machine OFF**
- **Topic**: `mistcharge/commands/power_off`
- **Message**:
```json
{
  "command": "power_off",
  "timestamp": "2025-08-03T22:35:00Z",
  "source": "aws_console",
  "parameters": {
    "reason": "manual_deactivation",
    "user": "admin"
  }
}
```

### **System Commands**

#### **Calibrate Sensors**
- **Topic**: `mistcharge/commands/calibrate`
- **Message**:
```json
{
  "command": "calibrate",
  "timestamp": "2025-08-03T22:35:00Z",
  "parameters": {
    "sensors": ["temperature", "humidity", "water_level"],
    "duration": 30,
    "mode": "full_calibration"
  }
}
```

#### **Restart Device**
- **Topic**: `mistcharge/commands/restart`
- **Message**:
```json
{
  "command": "restart",
  "timestamp": "2025-08-03T22:35:00Z",
  "parameters": {
    "reason": "system_maintenance",
    "delay": 5
  }
}
```

#### **Set Operating Mode**
- **Topic**: `mistcharge/commands/set_mode`
- **Message**:
```json
{
  "command": "set_mode",
  "timestamp": "2025-08-03T22:35:00Z",
  "parameters": {
    "mode": "efficient",
    "settings": {
      "power_level": "medium",
      "water_target": 5.0
    }
  }
}
```

#### **Emergency Stop**
- **Topic**: `mistcharge/commands/emergency_stop`
- **Message**:
```json
{
  "command": "emergency_stop",
  "timestamp": "2025-08-03T22:35:00Z",
  "parameters": {
    "reason": "safety_alert",
    "priority": "high"
  }
}
```

---

## 📊 **Real-time Testing Scenarios**

### **Scenario 1: Normal Operation**
1. **Turn ON**: `mistcharge/commands/power_on`
2. **Set Temperature**: `mistcharge/sensors/temperature` (value: 24.5)
3. **Set Humidity**: `mistcharge/sensors/humidity` (value: 75.2)
4. **Update Water Level**: `mistcharge/sensors/water_level` (value: 2.8)

### **Scenario 2: High Production Mode**
1. **Turn ON**: `mistcharge/commands/power_on`
2. **Set Mode**: `mistcharge/commands/set_mode` (mode: "high_production")
3. **Update Sensors**: Send all sensor data with higher values
4. **Monitor**: Check frontend for real-time updates

### **Scenario 3: Emergency Situation**
1. **Emergency Stop**: `mistcharge/commands/emergency_stop`
2. **Check Status**: Verify machine stops in frontend
3. **Restart**: `mistcharge/commands/restart`
4. **Resume**: `mistcharge/commands/power_on`

---

## 🔄 **Automated Testing Scripts**

### **Test All Sensors**
```bash
cd backend
node scripts/change-sensor-values.js
```

### **Test Power Commands**
```bash
cd backend
node scripts/test-commands.js
```

### **Test Dynamic Statistics**
```bash
cd backend
node scripts/test-dynamic-stats.js
```

---

## 📱 **Mobile App Integration**

### **Power Control via Mobile App**
The mobile app automatically sends commands to these topics:
- **Power ON**: `mistcharge/commands/power_on`
- **Power OFF**: `mistcharge/commands/power_off`

### **Real-time Updates**
The app subscribes to all sensor topics and updates automatically when you publish new data.

---

## 🎯 **Quick Test Commands**

### **Change Temperature**
- **Topic**: `mistcharge/sensors/temperature`
- **Message**: `{"value": 30.0, "timestamp": "2025-08-03T22:35:00Z"}`

### **Turn Machine ON**
- **Topic**: `mistcharge/commands/power_on`
- **Message**: `{"command": "power_on", "timestamp": "2025-08-03T22:35:00Z"}`

### **Turn Machine OFF**
- **Topic**: `mistcharge/commands/power_off`
- **Message**: `{"command": "power_off", "timestamp": "2025-08-03T22:35:00Z"}`

---

## 🔍 **Monitoring & Verification**

### **Check API Endpoints**
- **Health**: `curl http://localhost:3001/api/health`
- **Status**: `curl http://localhost:3001/api/status`
- **Stats**: `curl http://localhost:3001/api/stats`

### **Database Queries**
```sql
-- Check latest sensor readings
SELECT sensor_type, value, timestamp 
FROM sensor_readings 
ORDER BY timestamp DESC 
LIMIT 10;

-- Check power status
SELECT * FROM sensor_readings 
WHERE sensor_type = 'power_status' 
ORDER BY timestamp DESC 
LIMIT 5;
```

---

## ⚠️ **Important Notes**

1. **Timestamp Format**: Always use ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
2. **Value Types**: Ensure numeric values are numbers, not strings
3. **Topic Structure**: Follow the exact topic naming convention
4. **JSON Format**: Use valid JSON with proper quotes and commas
5. **Real-time Updates**: Frontend updates every 10 seconds
6. **Power Status**: Power commands are stored in database and reflected in frontend

---

## 🚀 **Getting Started**

1. **Start the system**: `./quick-start.sh`
2. **Open AWS IoT Console**: https://console.aws.amazon.com/iot/home#/test
3. **Test a sensor**: Send temperature data
4. **Test power control**: Turn machine ON/OFF
5. **Check frontend**: Verify updates in mobile app

**🎉 Your Mist Charge IoT system is ready for full command and control!** 