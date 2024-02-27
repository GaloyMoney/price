export const NotificationsService = (): INotificationsService => {
  const priceChanged = async (
    args: PriceChangedArgs
  ): Promise<void | NotificationsServiceError> => {
    const priceChangedEvent = createPriceChangedEvent(args);

    // Send event to notification service
  };
  return {
    priceChanged,
  };
};
