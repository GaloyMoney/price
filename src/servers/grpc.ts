/* eslint-disable @typescript-eslint/no-var-requires */
const PROTO_PATH = __dirname + "/protos/price.proto"
const PROTO_PATH_HEALTH = __dirname + "/protos/health.proto"

const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
}

// Suggested options for similarity to existing grpc.load behavior
const packageDefinition = protoLoader.loadSync(PROTO_PATH, options)

// The protoDescriptor object has the full package hierarchy
export const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)

const packageDefinitionHealth = protoLoader.loadSync(PROTO_PATH_HEALTH, options)

export const protoDescriptorHealth = grpc.loadPackageDefinition(packageDefinitionHealth)
