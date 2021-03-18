import { protoDescriptor } from "./grpc";
const grpc = require('@grpc/grpc-js');

const client = new protoDescriptor.PriceFeed('localhost:50051', grpc.credentials.createInsecure());

client.getPrice({}, callback)

function callback(err, {price}) {
  if (err) {
    console.error({err})
    return;
  }
  console.log({price})
}