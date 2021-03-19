import { protoDescriptor } from "./grpc";
const grpc = require('@grpc/grpc-js');

const logger = require('pino')()

const client = new protoDescriptor.PriceFeed('localhost:50051', grpc.credentials.createInsecure());

client.getPrice({}, callback)

function callback(err, {price}) {
  if (err) {
    logger.error({err})
    return;
  }
  logger.info({price})
}