const PriceDirection = {
  Increase: "Increase",
  Decrease: "Decrease",
} as const;

type PriceDirection = (typeof PriceDirection)[keyof typeof PriceDirection];

type PriceChangedEvent = {
  currentPriceInUsd: string;
  priceChangeDirection: PriceDirection;
  priceChangeInBips: string;
  timeRange: PriceRange;
  timestamp: string;
};

const createPriceChangedEvent = ({
  range,
  initialPrice,
  finalPrice,
}: PriceChangedArgs): PriceChangedEvent => {
  throw new Error("Method not implemented.");
};
