# 🚀 Mist Charge IoT - Startup Guide

## Quick Start Options

### Option 1: Simple QR Code (Recommended)
```bash
./quick-start.sh
```
This will:
- 🌐 **Automatically detect your network IP address**
- 🧹 Clean up any existing processes
- 🔧 Start the backend server
- 📱 Start the frontend with correct network configuration
- 📱 Display QR code to scan with your phone

### Option 2: Full System Monitor
```bash
./start-mist-charge.sh
```
This will:
- 🌐 **Automatically detect your network IP address**
- 🧹 Clean up existing processes
- 🔧 Start backend server
- 📱 Start frontend with correct network configuration
- 📊 Show system status
- 🔍 Monitor all services
- 🛑 Graceful shutdown with Ctrl+C

## 📱 How to Use

1. **Run the startup script:**
   ```bash
   ./quick-start.sh
   ```

2. **Wait for the QR code to appear** in the terminal

3. **Scan the QR code** with your phone:
   - **iOS**: Use the Camera app
   - **Android**: Use the Expo Go app

4. **Your app will open** and connect to the backend automatically

## 🔧 What Gets Started

### Backend Server (Port 3001)
- ✅ PostgreSQL database connection
- ✅ AWS IoT Core MQTT connection
- ✅ Real-time sensor data processing
- ✅ Dynamic statistics calculation
- ✅ Command handling
- ✅ **Network accessible** (listens on all interfaces)

### Frontend (Port 8081)
- ✅ React Native Expo development server
- ✅ **Automatic IP detection** and configuration
- ✅ Real-time data display
- ✅ Interactive statistics charts
- ✅ Mobile-responsive UI

## 📡 IoT Features Ready

- 🌡️ **Real-time sensor data** from AWS IoT Core
- 📊 **Dynamic statistics** that update automatically
- 🎛️ **Command control** via MQTT
- 📱 **Mobile app** with live updates
- 🔄 **Automatic data synchronization**

## 🛑 Stopping the System

### If using quick-start.sh:
- Press `Ctrl+C` in the terminal

### If using start-mist-charge.sh:
- Press `Ctrl+C` for graceful shutdown
- All processes will be cleaned up automatically

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
pkill -f "node.*server-iot.js"
pkill -f "npm run dev"
```

### Backend Not Starting
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if .env file exists
ls -la backend/.env
```

### Frontend Not Starting
```bash
# Reinstall dependencies
npm install

# Clear cache
npm start -- --clear
```

## 📊 System Status Check

Once running, you can check:
- **Health**: http://localhost:3001/api/health
- **Status**: http://localhost:3001/api/status  
- **Stats**: http://localhost:3001/api/stats

## 🎯 Next Steps

After scanning the QR code:
1. **Test sensor updates** using AWS IoT Core MQTT test client
2. **Send commands** to control your IoT devices
3. **Monitor statistics** in real-time
4. **Customize the app** for your specific needs

---

**🎉 Your Mist Charge IoT system is now ready for development!** 