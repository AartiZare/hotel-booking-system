import Hotel from '../models/hotel.model.js';
import { uploadToS3 } from '../utils/s3.js';

export const createHotel = async (req, res) => {
  try {
    const {
      name,
      description,
      city,
      address,
      defaultPrice,
      latitude,
      longitude
    } = req.body;

    const hotel = await Hotel.create({
      name,
      description,
      city,
      address,
      defaultPrice,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      createdBy: req.user.id
    });

    if (req.files?.length) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToS3(file, hotel._id))
      );
      hotel.photos = imageUrls;
      await hotel.save();
    }

    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      status: true
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or inactive' });
    }

    res.json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findOne({ _id: id, isActive: true });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const {
      name,
      description,
      city,
      address,
      defaultPrice,
      latitude,
      longitude,
      specialPricesToAdd,
      specialPricesToRemove
    } = req.body;

    if (name) hotel.name = name;
    if (description) hotel.description = description;
    if (city) hotel.city = city;
    if (address) hotel.address = address;
    if (defaultPrice) hotel.defaultPrice = defaultPrice;

    if (latitude && longitude) {
      hotel.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    if (req.files?.length) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToS3(file, hotel._id))
      );
      hotel.photos.push(...imageUrls);
    }

    if (specialPricesToRemove?.length) {
      hotel.specialPrices = hotel.specialPrices.filter(
        sp => !specialPricesToRemove.includes(sp._id.toString())
      );
    }

    if (specialPricesToAdd?.length) {
      for (const sp of specialPricesToAdd) {
        hotel.specialPrices = hotel.specialPrices.filter(existing =>
          new Date(sp.endDate) < existing.startDate ||
          new Date(sp.startDate) > existing.endDate
        );

        hotel.specialPrices.push({
          startDate: sp.startDate,
          endDate: sp.endDate,
          price: sp.price
        });
      }
    }

    await hotel.save();

    res.json({
      message: 'Hotel updated successfully',
      hotel
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHotels = async (req, res) => {
  const hotels = await Hotel.find({ isActive: true });
  res.json(hotels);
};

export const searchHotels = async (req, res) => {
  try {
    const { latitude, longitude, startDate, endDate, page = 1, limit = 10 } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const radiusInMeters = 50000; // 50 km radius

    const hotels = await Hotel.find({
      isActive: true,
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            radiusInMeters / 6378100
          ]
        }
      }
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const result = hotels.map(hotel => {
      let totalPrice = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const special = hotel.specialPrices.find(sp =>
          d >= new Date(sp.startDate) && d <= new Date(sp.endDate)
        );
        totalPrice += special ? special.price : hotel.defaultPrice;
      }
      return {
        hotelId: hotel._id,
        name: hotel.name,
        city: hotel.city,
        photos: hotel.photos,
        totalPrice
      };
    });

    const totalHotels = await Hotel.countDocuments({
      isActive: true,
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            radiusInMeters / 6378100
          ]
        }
      }
    });

    res.json({
      hotels: result,
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalHotels,
      totalPages: Math.ceil(totalHotels / limit),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

  hotel.isActive = false;
  await hotel.save();

  res.json({ message: 'Hotel deleted' });
};