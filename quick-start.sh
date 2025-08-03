#!/bin/bash

echo "🚀 Quick Start - Mist Charge IoT"
echo "================================"

# Get network IP address
echo "🌐 Detecting network IP address..."
if command -v jq &> /dev/null; then
    NETWORK_IP=$(node scripts/get-network-ip.js | jq -r '.ip')
else
    NETWORK_IP=$(node scripts/get-network-ip.js | grep -o '"ip":"[^"]*"' | cut -d'"' -f4)
fi
echo "📍 Network IP: $NETWORK_IP"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*server-iot.js" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

# Start backend
echo ""
echo "🔧 Starting backend server..."
cd backend
node server-iot.js &
BACKEND_PID=$!
cd ..

# Wait for backend
echo "⏳ Waiting for backend..."
sleep 5

# Check backend
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend ready!"
else
    echo "❌ Backend failed to start"
    exit 1
fi

echo ""
echo "📱 Starting frontend with network IP..."
echo "=============================================="

# Start frontend with network IP
EXPO_PUBLIC_API_URL="http://$NETWORK_IP:3001/api" npm run dev 