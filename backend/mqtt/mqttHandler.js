const mqtt = require('mqtt');

class MQTTHandler {
  constructor(options) {
    this.client = null;
    this.options = options;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.dataCallback = null;
  }

  connect() {
    console.log('Connecting to AWS IoT Core...');
    
    this.client = mqtt.connect(this.options.endpoint, {
      clientId: this.options.clientId,
      username: this.options.username,
      password: this.options.password,
      protocol: 'mqtts',
      port: 8883,
      ca: this.options.ca,
      cert: this.options.cert,
      key: this.options.key,
      rejectUnauthorized: true,
      keepalive: 60,
      clean: true,
    });

    this.client.on('connect', () => {
      console.log('Successfully connected to AWS IoT Core');
      this.reconnectAttempts = 0;
      this.subscribeToTopics();
    });

    this.client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received data from ${topic}:`, data);
        
        if (this.dataCallback) {
          this.dataCallback(topic, data);
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
      }
    });

    this.client.on('error', (error) => {
      console.error('MQTT connection error:', error);
      this.handleReconnect();
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
      this.handleReconnect();
    });

    this.client.on('offline', () => {
      console.log('MQTT client offline');
    });
  }

  subscribeToTopics() {
    const topics = [
      'mistcharge/sensors/temperature',
      'mistcharge/sensors/humidity',
      'mistcharge/sensors/water_level',
      'mistcharge/sensors/battery',
      'mistcharge/sensors/water_quality',
      'mistcharge/status/+', // Wildcard for status updates
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });
  }

  publishCommand(command, parameters = {}) {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client not connected');
    }

    const topic = `mistcharge/commands/${command}`;
    const payload = JSON.stringify({
      command,
      parameters,
      timestamp: new Date().toISOString(),
      id: `cmd_${Date.now()}`,
    });

    return new Promise((resolve, reject) => {
      this.client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Failed to publish command ${command}:`, err);
          reject(err);
        } else {
          console.log(`Published command ${command} to ${topic}`);
          resolve();
        }
      });
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Manual intervention required.');
    }
  }

  onData(callback) {
    this.dataCallback = callback;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }

  isConnected() {
    return this.client && this.client.connected;
  }
}

module.exports = MQTTHandler;