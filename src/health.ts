import { protoDescriptorHealth } from "./grpc";

// Import package
export const healthCheck = require('grpc-health-check');

// Define service status map. Key is the service name, value is the corresponding status.
// By convention, the empty string "" key represents that status of the entire server.
const statusMap = {
  "": 1, // SERVING
};

// Construct the service implementation
export const healthImpl = new healthCheck.Implementation(statusMap);
