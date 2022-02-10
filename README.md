# Galoy Price

This repository includes the next servers:

- [realtime price](./realtime): exposes a GRPC endpoint providing a near real-time BTC price

## How to run servers commands

```bash
yarn <server> <internal command>
```

Example:

```bash
yarn realtime build
```

## Docker images

To build docker images manually run the next commands from the root folder:

### Realtime
```bash
docker build -f ./realtime/Dockerfile -t galoy-price .
```
