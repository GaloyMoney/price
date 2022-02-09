/* eslint-disable @typescript-eslint/no-var-requires */
const PROTO_PATH_PRICE = __dirname + "/protos/price.proto"
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

const definitionPrice = protoLoader.loadSync(PROTO_PATH_PRICE, options)
export const protoDescriptorPrice = grpc.loadPackageDefinition(definitionPrice)

const definitionHealth = protoLoader.loadSync(PROTO_PATH_HEALTH, options)
export const protoDescriptorHealth = grpc.loadPackageDefinition(definitionHealth)
