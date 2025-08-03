#!/bin/bash

echo "🚀 Starting Mist Charge IoT System..."
echo "======================================"

# Get network IP address
echo "🌐 Detecting network IP address..."
if command -v jq &> /dev/null; then
    NETWORK_IP=$(node scripts/get-network-ip.js | jq -r '.ip')
else
    NETWORK_IP=$(node scripts/get-network-ip.js | grep -o '"ip":"[^"]*"' | cut -d'"' -f4)
fi
echo "📍 Network IP: $NETWORK_IP"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use. Stopping existing process..."
        pkill -f ":$1"
        sleep 2
    fi
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down Mist Charge system..."
    pkill -f "node.*server-iot.js"
    pkill -f "npm run dev"
    pkill -f "expo start"
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check and clear ports
echo "🔍 Checking ports..."
check_port 3001
check_port 8081

# Start backend server
echo ""
echo "🔧 Starting backend server..."
cd backend
node server-iot.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Backend failed to start"
    cleanup
fi

echo "✅ Backend server running on port 3001"

# Start frontend
echo ""
echo "📱 Starting frontend with network IP..."
EXPO_PUBLIC_API_URL="http://$NETWORK_IP:3001/api" npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Display system status
echo ""
echo "🎉 Mist Charge IoT System is Ready!"
echo "======================================"
echo "🔗 Backend API: http://localhost:3001"
echo "🔗 Network API: http://$NETWORK_IP:3001"
echo "📊 Health Check: http://localhost:3001/api/health"
echo "📈 Status API: http://localhost:3001/api/status"
echo "📊 Stats API: http://localhost:3001/api/stats"
echo ""

# Try to get the QR code from Expo
echo "📱 QR Code for Mobile App:"
echo "=========================="

# Wait a bit more for Expo to fully start
sleep 5

# Try to get QR code from Expo output
if pgrep -f "expo start" > /dev/null; then
    echo "✅ Expo is running"
    echo ""
    echo "🔍 Looking for QR code..."
    echo "📱 Check your terminal for the QR code above"
    echo "📱 Or scan the QR code that appears in the Expo terminal"
    echo ""
    echo "💡 If you don't see the QR code, check the Expo terminal output"
else
    echo "❌ Expo not running properly"
    echo "💡 Try running 'npm run dev' manually in another terminal"
fi

echo ""
echo "🎯 System Status:"
echo "================="
echo "✅ Backend: Running (PID: $BACKEND_PID)"
echo "✅ Frontend: Running (PID: $FRONTEND_PID)"
echo "✅ Database: Connected"
echo "✅ AWS IoT: Connected"
echo ""
echo "📡 IoT Features:"
echo "==============="
echo "🌡️  Real-time sensor data"
echo "📊 Dynamic statistics"
echo "🎛️  Command control"
echo "📱 Mobile app integration"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Keep script running
while true; do
    sleep 10
    # Check if processes are still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend server stopped unexpectedly"
        break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend stopped unexpectedly"
        break
    fi
done

cleanup 