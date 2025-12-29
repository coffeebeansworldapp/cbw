const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// Configure the OTLP exporter to send traces to AI Toolkit
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

// Create and configure the SDK
const sdk = new NodeSDK({
  serviceName: 'coffee-beans-backend',
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Automatically instrument Express, MongoDB, and HTTP
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable file system instrumentation to reduce noise
      },
    }),
  ],
});

// Start the SDK
sdk.start();
console.log('Tracing initialized - sending traces to AI Toolkit at http://localhost:4318');

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

module.exports = sdk;
