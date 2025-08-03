# Mist Charge - Atmospheric Water Generator IoT App

A complete cross-platform mobile application for monitoring and controlling atmospheric water generators, built with React Native (Expo) and Node.js backend with AWS IoT Core integration.

## 🚀 Features

### Mobile App (React Native/Expo)
- **Real-time Dashboard**: Live monitoring of temperature, humidity, water collection, and battery
- **Interactive UI**: Circular battery meter, horizontal progress bars, and animated components
- **Water Quality Monitoring**: Safety indicators with detailed quality metrics
- **Historical Analytics**: 7-day collection statistics with bar charts
- **Cross-platform**: Runs on iOS, Android, and Web
- **Responsive Design**: Optimized for all screen sizes

### Backend API (Node.js)
- **AWS IoT Core Integration**: MQTT connection for real-time sensor data
- **PostgreSQL Database**: AWS RDS hosted data storage
- **REST API**: RESTful endpoints for status, statistics, and device control
- **Real-time Updates**: MQTT message handling and data persistence
- **Device Commands**: Send calibration and control commands to devices

## 📱 Mobile App Setup

### Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Studio for testing

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Running on Different Platforms

```bash
# iOS (requires Mac with Xcode)
npm run dev -- --ios

# Android (requires Android Studio/emulator)
npm run dev -- --android

# Web browser
npm run dev -- --web
```

## 🛠 Backend Setup

### Prerequisites
- Node.js 18+ installed
- AWS Account with IoT Core and RDS access
- PostgreSQL database on AWS RDS

### Installation

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your AWS credentials and database config
nano .env

# Initialize database
npm run init-db

# Start development server
npm run dev
```

### Environment Configuration

Update `.env` file with your AWS credentials:

```env
# Database (AWS RDS PostgreSQL)
DB_HOST=your-rds-endpoint.amazonaws.com
DB_NAME=mistcharge
DB_USER=your-username
DB_PASSWORD=your-password

# AWS IoT Core
AWS_IOT_ENDPOINT=your-endpoint.iot.region.amazonaws.com
AWS_IOT_CLIENT_ID=mist-charge-backend
```

## 🔧 AWS Setup Guide

### 1. AWS RDS PostgreSQL Setup

1. **Create RDS Instance**:
   ```bash
   # Using AWS CLI
   aws rds create-db-instance \
     --db-instance-identifier mistcharge-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password your-secure-password \
     --allocated-storage 20
   ```

2. **Configure Security Groups**:
   - Allow inbound connections on port 5432
   - Restrict access to your backend server IPs

3. **Get Connection Details**:
   - Endpoint URL from RDS console
   - Update `.env` file with connection details

### 2. AWS IoT Core Setup

1. **Create IoT Thing**:
   ```bash
   aws iot create-thing --thing-name MistChargeDevice
   ```

2. **Create and Download Certificates**:
   ```bash
   aws iot create-keys-and-certificate \
     --set-as-active \
     --certificate-pem-outfile certificate.pem.crt \
     --private-key-outfile private.pem.key \
     --public-key-outfile public.pem.key
   ```

3. **Create IoT Policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "iot:Connect",
           "iot:Publish",
           "iot:Subscribe",
           "iot:Receive"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

4. **MQTT Topics Structure**:
   - `mistcharge/sensors/temperature` - Temperature readings
   - `mistcharge/sensors/humidity` - Humidity readings
   - `mistcharge/sensors/water_level` - Water level data
   - `mistcharge/sensors/battery` - Battery percentage
   - `mistcharge/sensors/water_quality` - Water quality status
   - `mistcharge/commands/+` - Device commands (calibrate, restart, etc.)

## 📊 API Endpoints

### GET /api/status
Returns current sensor readings:
```json
{
  "temperature": 23.5,
  "humidity": 84,
  "waterLevel": 2.3,
  "batteryLevel": 89,
  "waterQuality": "safe",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### GET /api/stats
Returns historical data for charts:
```json
[
  {
    "day": "Mon",
    "amount": 1.8,
    "max": 2.1,
    "min": 1.5
  }
]
```

### POST /api/update
Manual data update:
```json
{
  "sensorType": "temperature",
  "value": 24.5,
  "metadata": {
    "location": "outdoor_sensor"
  }
}
```

### POST /api/command
Send device commands:
```json
{
  "command": "calibrate",
  "parameters": {
    "sensors": ["temperature", "humidity"]
  }
}
```

## 🗄 Database Schema

### sensor_readings table
```sql
CREATE TABLE sensor_readings (
  id SERIAL PRIMARY KEY,
  sensor_type VARCHAR(50) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Security Features

- **Environment Variables**: Secure credential management
- **SSL/TLS**: Encrypted database and MQTT connections
- **Certificate Authentication**: AWS IoT Core device certificates
- **Input Validation**: API parameter validation and sanitization
- **Error Handling**: Comprehensive error logging and handling

## 📈 Monitoring & Logging

- **Health Check Endpoint**: `/api/health` for service monitoring
- **MQTT Connection Status**: Real-time connection monitoring
- **Database Connection Pooling**: Efficient database resource management
- **Automatic Reconnection**: Robust MQTT reconnection logic

## 🚀 Production Deployment

### Backend Deployment (AWS EC2/ECS)

1. **Prepare for deployment**:
   ```bash
   # Build production version
   npm run build
   
   # Start with PM2 for production
   npm install -g pm2
   pm2 start server.js --name "mist-charge-api"
   ```

2. **Set up reverse proxy** (Nginx):
   ```nginx
   server {
     listen 80;
     server_name your-api-domain.com;
     
     location / {
       proxy_pass http://localhost:3001;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

### Mobile App Deployment

1. **Build for production**:
   ```bash
   # Build for web
   npm run build:web
   
   # Build for mobile (requires EAS)
   npx eas build --platform all
   ```

2. **Deploy to app stores**:
   ```bash
   # Submit to App Store and Google Play
   npx eas submit --platform all
   ```

## 🧪 Testing

### Backend API Testing
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test status endpoint
curl http://localhost:3001/api/status

# Send test data
curl -X POST http://localhost:3001/api/update \
  -H "Content-Type: application/json" \
  -d '{"sensorType": "temperature", "value": 25.0}'
```

### MQTT Testing
```bash
# Install mosquitto clients for testing
brew install mosquitto  # macOS
sudo apt install mosquitto-clients  # Ubuntu

# Test publish
mosquitto_pub -h your-iot-endpoint.amazonaws.com -p 8883 \
  --cafile AmazonRootCA1.pem \
  --cert certificate.pem.crt \
  --key private.pem.key \
  -t mistcharge/sensors/temperature \
  -m '{"value": 26.5, "timestamp": "2024-01-15T10:30:00Z"}'
```

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │◄──►│   Backend API    │◄──►│   AWS IoT Core  │
│ (React Native)  │    │   (Node.js)      │    │     (MQTT)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   PostgreSQL     │    │   IoT Device    │
                       │   (AWS RDS)      │    │ (Water Generator)│
                       └──────────────────┘    └─────────────────┘
```

## 📝 Development Notes

- The mobile app includes mock data for development and testing
- Real-time updates are simulated every 5 seconds in development mode
- Backend includes comprehensive error handling and logging
- Database schema supports extensible sensor types and metadata
- MQTT handler includes automatic reconnection and error recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.