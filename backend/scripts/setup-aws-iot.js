const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const THING_NAME = 'MistChargeDevice';
const POLICY_NAME = 'MistChargePolicy';
const CERT_DIR = path.join(__dirname, '..', 'certs');

console.log('🚀 Setting up AWS IoT Core for Mist Charge...\n');

// Create certificates directory
if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

try {
  // Step 1: Create IoT Thing
  console.log('1. Creating IoT Thing...');
  execSync(`aws iot create-thing --thing-name ${THING_NAME}`, { stdio: 'inherit' });
  console.log('✅ IoT Thing created successfully\n');

  // Step 2: Create and download certificates
  console.log('2. Creating certificates...');
  const certOutput = execSync(`aws iot create-keys-and-certificate \
    --set-as-active \
    --certificate-pem-outfile ${CERT_DIR}/certificate.pem.crt \
    --private-key-outfile ${CERT_DIR}/private.pem.key \
    --public-key-outfile ${CERT_DIR}/public.pem.key`, { encoding: 'utf8' });
  
  const certData = JSON.parse(certOutput);
  const certificateArn = certData.certificateArn;
  const certificateId = certData.certificateId;
  
  console.log('✅ Certificates created and downloaded\n');

  // Step 3: Create IoT Policy
  console.log('3. Creating IoT Policy...');
  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "iot:Connect",
          "iot:Publish",
          "iot:Subscribe",
          "iot:Receive"
        ],
        Resource: "*"
      }
    ]
  };

  fs.writeFileSync(`${CERT_DIR}/policy.json`, JSON.stringify(policyDocument, null, 2));
  
  execSync(`aws iot create-policy \
    --policy-name ${POLICY_NAME} \
    --policy-document file://${CERT_DIR}/policy.json`, { stdio: 'inherit' });
  
  console.log('✅ IoT Policy created successfully\n');

  // Step 4: Attach policy to certificate
  console.log('4. Attaching policy to certificate...');
  execSync(`aws iot attach-policy \
    --policy-name ${POLICY_NAME} \
    --target ${certificateArn}`, { stdio: 'inherit' });
  
  console.log('✅ Policy attached to certificate\n');

  // Step 5: Attach certificate to thing
  console.log('5. Attaching certificate to thing...');
  execSync(`aws iot attach-thing-principal \
    --thing-name ${THING_NAME} \
    --principal ${certificateArn}`, { stdio: 'inherit' });
  
  console.log('✅ Certificate attached to thing\n');

  // Step 6: Get IoT endpoint
  console.log('6. Getting IoT endpoint...');
  const endpointOutput = execSync('aws iot describe-endpoint --endpoint-type iot:Data-ATS', { encoding: 'utf8' });
  const endpointData = JSON.parse(endpointOutput);
  const endpoint = endpointData.endpointAddress;
  
  console.log('✅ IoT endpoint retrieved\n');

  // Step 7: Download root CA certificate
  console.log('7. Downloading root CA certificate...');
  execSync(`curl -o ${CERT_DIR}/AmazonRootCA1.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem`, { stdio: 'inherit' });
  
  console.log('✅ Root CA certificate downloaded\n');

  // Step 8: Create .env file with IoT configuration
  console.log('8. Creating .env file with IoT configuration...');
  const envContent = `# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mistcharge
DB_USER=mistcharge
DB_PASSWORD=mistcharge123

# AWS IoT Core Configuration
AWS_IOT_ENDPOINT=${endpoint}
AWS_IOT_CLIENT_ID=mist-charge-backend
AWS_IOT_THING_NAME=${THING_NAME}

# Certificate paths (relative to backend directory)
AWS_IOT_CA_CERT_PATH=certs/AmazonRootCA1.pem
AWS_IOT_CLIENT_CERT_PATH=certs/certificate.pem.crt
AWS_IOT_PRIVATE_KEY_PATH=certs/private.pem.key

# Server Configuration
PORT=3001
`;

  fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
  
  console.log('✅ .env file updated with IoT configuration\n');

  // Step 9: Display summary
  console.log('🎉 AWS IoT Core setup completed successfully!\n');
  console.log('📋 Summary:');
  console.log(`   • IoT Thing: ${THING_NAME}`);
  console.log(`   • Certificate ID: ${certificateId}`);
  console.log(`   • IoT Endpoint: ${endpoint}`);
  console.log(`   • Policy: ${POLICY_NAME}`);
  console.log(`   • Certificates saved in: ${CERT_DIR}\n`);

  console.log('📝 Next steps:');
  console.log('   1. Update your .env file with the endpoint above');
  console.log('   2. Start the IoT-enabled server');
  console.log('   3. Test MQTT connectivity');
  console.log('   4. Send test sensor data\n');

} catch (error) {
  console.error('❌ Error during AWS IoT setup:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   • Make sure AWS CLI is configured with proper credentials');
  console.log('   • Ensure you have IoT Core permissions in your AWS account');
  console.log('   • Check if the thing/certificate already exists');
} 