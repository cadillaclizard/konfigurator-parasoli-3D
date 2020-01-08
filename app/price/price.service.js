app.factory("priceService", function() {
	var modelPrice = 0;
	var fullPrice = 0;
	var deliveryPrice = 0;
	var discount = 0;

	return {
		getModelPrice() { return modelPrice; },
		getFullPrice(modificator) { return fullPrice * modificator; },
		getDeliveryPrice() { return deliveryPrice; },
		setModelPrice(price) { modelPrice = price; },
		setFullPrice(price) { fullPrice = price; },
		setDeliveryPrice(price) { deliveryPrice = price; },
		setDiscount(d) { discount = d; },
		getDiscount() { return discount; }
	}
});