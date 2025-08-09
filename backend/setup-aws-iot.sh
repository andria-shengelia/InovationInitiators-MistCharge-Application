#!/bin/bash

echo "🚀 AWS IoT Core Setup for Mist Charge"
echo "====================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    echo "📥 Please install AWS CLI first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured"
    echo "🔧 Please configure AWS CLI with your credentials:"
    echo "   aws configure"
    exit 1
fi

echo "✅ AWS CLI is configured"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Create certs directory if it doesn't exist
mkdir -p certs

echo "🔧 Setting up AWS IoT Core..."
echo ""

# Run the setup script
node scripts/setup-aws-iot.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 AWS IoT Core setup completed!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update your .env file with the endpoint above"
    echo "   2. Restart your server: ./quick-start.sh"
    echo "   3. Test MQTT: node test-mqtt.js"
    echo ""
    echo "🔐 Your certificates are saved in: ./certs/"
    echo "⚠️  Keep these certificates secure!"
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    echo ""
    echo "🔧 Common issues:"
    echo "   • Make sure you have IoT Core permissions in AWS"
    echo "   • Check if the thing/certificate already exists"
    echo "   • Ensure your AWS credentials have the right permissions"
fi 