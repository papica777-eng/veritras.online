"use strict";
/**
 * tracing — Qantum Module
 * @module tracing
 * @path core/tracing.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTracing = void 0;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const sdk = new sdk_node_1.NodeSDK({
    resource: new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: 'qantum-core',
        [semantic_conventions_1.SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'development',
    }),
    traceExporter: new exporter_jaeger_1.JaegerExporter({
        endpoint: 'http://localhost:14268/api/traces',
    }),
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
});
const startTracing = () => {
    sdk.start();
    console.log('🚀 Tracing initialized: Exporting to Jaeger');
};
exports.startTracing = startTracing;
process.on('SIGTERM', () => {
    sdk
        .shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
