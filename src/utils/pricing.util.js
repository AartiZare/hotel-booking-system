export const getPriceForDate = (hotel, date) => {
    const target = new Date(date);

    const special = hotel.specialPrices.find(sp =>
        target >= sp.startDate && target <= sp.endDate
    );

    return special ? special.price : hotel.defaultPrice;
};

export const calculateTotalPrice = (hotel, startDate, endDate) => {
    let total = 0;

    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current < end) {
        total += getPriceForDate(hotel, current);
        current.setDate(current.getDate() + 1);
    }

    return total;
};
