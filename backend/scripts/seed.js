const mongoose = require('mongoose');
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const dotenv = require('dotenv');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const Tariff = require('../models/Tariff');

// Load env variables
dotenv.config({ path: './.env' });

const seedData = async () => {
  let shouldClose = false;
  try {
    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rider_tours');
      console.log('MongoDB Connected for Seeding...');
      shouldClose = true;
    }

    // Clear existing collections
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await Enquiry.deleteMany({});
    await Tariff.deleteMany({});
    console.log('Collections cleared.');

    // 1. Create Default Admin
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@ridertours.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
    });
    console.log(`Admin user created: ${adminUser.email} (Password: admin123)`);

    // 2. Create Fleet Vehicles
    const vehiclesData = [
      {
        name: 'Maruti Dzire',
        category: 'Sedan',
        capacity: 5,
        features: ['AC', 'Bluetooth Audio System', 'Dual Airbags', 'Luggage Space (3 bags)', 'Charging Port'],
        pricing: {
          hrs4_kms40: 1600,
          hrs8_kms80: 2600,
          extraHr: 250,
          extraKm: 18,
          outstationRate: 18,
          minKmsDay: 300,
          discountedPrice: 5130,
        },
        imageUrl: 'https://imgd-ct.aeplcdn.com/664x415/n/cw/ec/170299/dzire-2024-right-front-three-quarter.jpeg?isig=0&q=80',
        available: true,
      },
      {
        name: 'Toyota Etios',
        category: 'Sedan',
        capacity: 5,
        features: ['AC', 'Music System', 'GPS Navigation', 'Spacious Legroom', 'USB Charger'],
        pricing: {
          hrs4_kms40: 1600,
          hrs8_kms80: 2600,
          extraHr: 250,
          extraKm: 18,
          outstationRate: 18,
          minKmsDay: 300,
          discountedPrice: 5130,
        },
        imageUrl: 'https://ic4.maxabout.us/autos/cars_india/T/2016/9/toyota-etios-classic-grey-2.jpg',
        available: true,
      },
      {
        name: 'Maruti Ertiga',
        category: 'MPV',
        capacity: 7,
        features: ['Dual AC', 'Touch Screen Audio', 'Rear Camera', 'Luggage Space (4 bags)', 'Captain Seats'],
        pricing: {
          hrs4_kms40: 2000,
          hrs8_kms80: 3500,
          extraHr: 325,
          extraKm: 21,
          outstationRate: 21,
          minKmsDay: 300,
          discountedPrice: 5985,
        },
        imageUrl: 'https://imgd-ct.aeplcdn.com/1056x660/n/cw/ec/115823/2022-ertiga-left-front-three-quarter.jpeg?isig=0&q=80',
        available: true,
      },
      {
        name: 'Kia Carens',
        category: 'MPV',
        capacity: 7,
        features: ['Automatic Climate Control', 'Premium Audio', 'Ambient Lighting', 'Charging Ports for all rows', 'Foldable Seats'],
        pricing: {
          hrs4_kms40: 2000,
          hrs8_kms80: 3500,
          extraHr: 325,
          extraKm: 21,
          outstationRate: 21,
          minKmsDay: 300,
          discountedPrice: 5985,
        },
        imageUrl: 'https://imgd-ct.aeplcdn.com/1056x660/n/cw/ec/174327/carens-right-front-three-quarter-2.jpeg?isig=0&q=80',
        available: true,
      },
      {
        name: 'Toyota Rumion',
        category: 'MPV',
        capacity: 7,
        features: ['Dual AC', 'Touch Screen Audio', 'Rear Parking Camera', 'Spacious Seating', 'ISOFIX Mounts', 'USB Chargers'],
        pricing: {
          hrs4_kms40: 2000,
          hrs8_kms80: 3500,
          extraHr: 325,
          extraKm: 21,
          outstationRate: 21,
          minKmsDay: 300,
          discountedPrice: 5985,
        },
        imageUrl: 'https://cdn-s3.autocarindia.com/legacy/cdni/mmv_images/colors/20250714024406_Toyota_Rumion_Cafe_White[1].jpg?w=640&q=75&fm=auto',
        available: true,
      },
      {
        name: 'Toyota Innova Crysta',
        category: 'Premium',
        capacity: 7,
        features: ['Dual Zone AC', 'Leather Captain Seats', 'Premium Audio System', 'Ample Leg Space', 'Reading Lights', 'GPS & Wifi Hotspot'],
        pricing: {
          hrs4_kms40: 2200,
          hrs8_kms80: 4000,
          extraHr: 400,
          extraKm: 23,
          outstationRate: 23,
          minKmsDay: 300,
          discountedPrice: 6555,
        },
        imageUrl: 'https://www.rushlane.com/wp-content/uploads/2023/03/toyota-innova-crysta-top-variant.jpg',
        available: true,
      },
      {
        name: 'Toyota Innova Hycross',
        category: 'Luxury',
        capacity: 7,
        features: ['Silent Electric Mode', 'Panoramic Sunroof', 'Ottoman Recliner Seats', 'JBL Premium Surround Sound', 'Multi-zone Climate Control', 'ADAS Safety Tech'],
        pricing: {
          hrs4_kms40: 3000,
          hrs8_kms80: 5000,
          extraHr: 500,
          extraKm: 30,
          outstationRate: 30,
          minKmsDay: 300,
          discountedPrice: 8550,
        },
        imageUrl: 'https://imgd-ct.aeplcdn.com/664x415/n/cw/ec/116205/innova-hycross-right-front-three-quarter-2.jpeg?isig=0&q=80',
        available: true,
      },
      {
        name: 'Tempo Traveller',
        category: 'Tempo Traveller',
        capacity: 13,
        features: ['Individual Airvents', 'Pushback Luxury Seats', 'LED TV Screen', 'High Roof Design', 'Ample Luggage Gallery', 'Microphone Setup'],
        pricing: {
          hrs4_kms40: 2500,
          hrs8_kms80: 5000,
          extraHr: 500,
          extraKm: 27,
          outstationRate: 27,
          minKmsDay: 300,
          discountedPrice: 7695,
        },
        imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2025/5/510408938/ZV/OB/LY/244792922/26-seater-tempo-traveller-rental-service-1000x1000.jpg',
        available: true,
      },
      {
        name: 'Urbania',
        category: 'Urbania',
        capacity: 13,
        features: ['German Engineered Comfort', 'Reclining Luxury Seats with Armrest', 'Individually Controlled AC', 'Personal Charging Ports', 'LCD Entertainment Screen', 'Ambient Lighting', 'Large Cargo Compartment'],
        pricing: {
          hrs4_kms40: 5000,
          hrs8_kms80: 10000,
          extraHr: 1000,
          extraKm: 40,
          outstationRate: 40,
          minKmsDay: 300,
          discountedPrice: 11400,
        },
        imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.gIsq_XuJlFC8kk1GPdfuMAHaF3?pid=Api&P=0&h=180',
        available: true,
      },
      {
        name: 'Honda Amaze',
        category: 'Sedan',
        capacity: 5,
        features: ['AC', 'Audio System', 'Airbags', 'Comfortable Cabin', 'Rear Armrest'],
        pricing: {
          hrs4_kms40: 1600,
          hrs8_kms80: 2600,
          extraHr: 250,
          extraKm: 18,
          outstationRate: 18,
          minKmsDay: 300,
          discountedPrice: 5130,
        },
        imageUrl: 'https://imgd-ct.aeplcdn.com/1056x660/n/cw/ec/184379/amaze-right-front-three-quarter-3.jpeg?isig=0&q=80',
        available: true,
      },
      {
        name: 'Toyota Glanza',
        category: 'Sedan',
        capacity: 5,
        features: ['AC', 'Touchscreen System', 'Airbags', 'Efficient Engine', 'Smart Start'],
        pricing: {
          hrs4_kms40: 1600,
          hrs8_kms80: 2600,
          extraHr: 250,
          extraKm: 18,
          outstationRate: 18,
          minKmsDay: 300,
          discountedPrice: 5130,
        },
        imageUrl: 'https://imgd-ct.aeplcdn.com/1056x660/n/cw/ec/206488/glanza-right-front-three-quarter.jpeg?isig=0&q=80',
        available: true,
      },
    ];

    const seededVehicles = await Vehicle.insertMany(vehiclesData);
    console.log(`${seededVehicles.length} vehicles seeded successfully!`);

    // 3. Create Sample Bookings for Admin Analytics
    // Let's create some dummy bookings with dates in the past few days to populate the admin charts
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const sampleBookings = [
      {
        bookingId: 'RT-1001',
        customerName: 'Karthik Raja',
        email: 'karthik@example.com',
        phone: '9876543210',
        pickup: 'Chennai Airport (MAA)',
        drop: 'OMR, Chennai',
        date: new Date(now - 4 * oneDay).toISOString().split('T')[0],
        time: '10:30',
        vehicle: seededVehicles[5]._id, // Innova Crysta
        tripType: 'Local',
        estimatedFare: 4000,
        status: 'Completed',
        paymentStatus: 'Paid',
        razorpayPaymentId: 'pay_ABC123xyz',
        kms: 80,
        createdAt: new Date(now - 4 * oneDay),
      },
      {
        bookingId: 'RT-1002',
        customerName: 'Meera Nambiar',
        email: 'meera@example.com',
        phone: '9845123456',
        pickup: 'Adyar, Chennai',
        drop: 'Pondicherry',
        date: new Date(now - 3 * oneDay).toISOString().split('T')[0],
        time: '06:00',
        vehicle: seededVehicles[6]._id, // Innova Hycross
        tripType: 'Outstation',
        estimatedFare: 9000,
        status: 'Completed',
        paymentStatus: 'Paid',
        razorpayPaymentId: 'pay_DEF456uvw',
        kms: 300,
        createdAt: new Date(now - 3 * oneDay),
      },
      {
        bookingId: 'RT-1003',
        customerName: 'Suresh Kumar',
        email: 'suresh@example.com',
        phone: '9123456789',
        pickup: 'T Nagar, Chennai',
        drop: 'Mahabalipuram',
        date: new Date(now - 2 * oneDay).toISOString().split('T')[0],
        time: '08:00',
        vehicle: seededVehicles[0]._id, // Dzire
        tripType: 'Outstation',
        estimatedFare: 5400,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        razorpayPaymentId: 'pay_GHI789rst',
        kms: 300,
        createdAt: new Date(now - 2 * oneDay),
      },
      {
        bookingId: 'RT-1004',
        customerName: 'Ramesh Krishnan',
        email: 'ramesh@example.com',
        phone: '9444123456',
        pickup: 'Guindy, Chennai',
        drop: 'Guindy National Park',
        date: new Date(now - 1 * oneDay).toISOString().split('T')[0],
        time: '14:00',
        vehicle: seededVehicles[2]._id, // Ertiga
        tripType: 'Local',
        estimatedFare: 2000,
        status: 'Pending',
        paymentStatus: 'Pending',
        kms: 40,
        createdAt: new Date(now - 1 * oneDay),
      },
      {
        bookingId: 'RT-1005',
        customerName: 'Cognizant Corporate',
        email: 'travels@cognizant.com',
        phone: '9884123456',
        pickup: 'DLF IT Park, Ramapuram',
        drop: 'OMR, Karapakkam',
        date: now.toISOString().split('T')[0],
        time: '18:00',
        vehicle: seededVehicles[8]._id, // Urbania
        tripType: 'Local',
        estimatedFare: 10000,
        status: 'Confirmed',
        paymentStatus: 'Pending',
        kms: 80,
        createdAt: now,
      },
    ];

    await Booking.insertMany(sampleBookings);
    console.log('Sample bookings seeded.');

    // 4. Create Sample Enquiries
    const sampleEnquiries = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9003123456',
        subject: 'Corporate Fleet Contract',
        message: 'Looking for daily employee transport options for 50 employees from OMR to Guindy. Please share packages.',
        status: 'New',
        createdAt: new Date(now - 2 * oneDay),
      },
      {
        name: 'Priya Ravichandran',
        email: 'priya@example.com',
        phone: '9940123456',
        subject: 'Wedding Transportation Enquiry',
        message: 'Need 3 Innovas and 1 Tempo Traveller for wedding transport in Chennai on June 15th. Please let us know availability.',
        status: 'Replied',
        createdAt: new Date(now - 5 * oneDay),
      },
    ];

    await Enquiry.insertMany(sampleEnquiries);
    console.log('Sample enquiries seeded.');

    // 5. Seed Tariffs
    const tariffsData = [
      {
        category: 'Sedan',
        slug: 'sedan',
        capacity: '4 + 1 Seats',
        capacitySeats: 5,
        vehicles: ['Maruti Dzire', 'Honda Amaze', 'Toyota Etios', 'Toyota Glanza'],
        pricing: {
          local40km: 1600,
          local80km: 2600,
          extraHour: 250,
          extraKm: 18,
          outstationRate: 18,
          minimumDayRate: 5400,
          discountPrice: 5130
        },
        minKmsPerDay: 300,
        weddingCharge: 5000
      },
      {
        category: 'MPV',
        slug: 'mpv',
        capacity: '6 + 1 Seats',
        capacitySeats: 7,
        vehicles: ['Kia Carens', 'Maruti Ertiga', 'Toyota Rumion'],
        pricing: {
          local40km: 2000,
          local80km: 3500,
          extraHour: 325,
          extraKm: 21,
          outstationRate: 21,
          minimumDayRate: 6300,
          discountPrice: 5985
        },
        minKmsPerDay: 300,
        weddingCharge: 6000
      },
      {
        category: 'Premium',
        slug: 'premium',
        capacity: '6 + 1 Seats',
        capacitySeats: 7,
        vehicles: ['Toyota Innova Crysta'],
        pricing: {
          local40km: 2200,
          local80km: 4000,
          extraHour: 400,
          extraKm: 23,
          outstationRate: 23,
          minimumDayRate: 6900,
          discountPrice: 6555
        },
        minKmsPerDay: 300,
        weddingCharge: 8000
      },
      {
        category: 'Luxury',
        slug: 'luxury',
        capacity: '6 + 1 Seats',
        capacitySeats: 7,
        vehicles: ['Toyota Innova Hycross'],
        pricing: {
          local40km: 3000,
          local80km: 5000,
          extraHour: 500,
          extraKm: 30,
          outstationRate: 30,
          minimumDayRate: 9000,
          discountPrice: 8550
        },
        minKmsPerDay: 300,
        weddingCharge: 10000
      },
      {
        category: 'Tempo Traveller',
        slug: 'tempo-traveller',
        capacity: '12 + 1 Seats',
        capacitySeats: 13,
        vehicles: ['Tempo Traveller'],
        pricing: {
          local40km: 2500,
          local80km: 5000,
          extraHour: 500,
          extraKm: 27,
          outstationRate: 27,
          minimumDayRate: 8100,
          discountPrice: 7695
        },
        minKmsPerDay: 300,
        weddingCharge: 12000
      },
      {
        category: 'Urbania',
        slug: 'urbania',
        capacity: '12 + 1 Seats',
        capacitySeats: 13,
        vehicles: ['Urbania'],
        pricing: {
          local40km: 5000,
          local80km: 10000,
          extraHour: 1000,
          extraKm: 40,
          outstationRate: 40,
          minimumDayRate: 12000,
          discountPrice: 11400
        },
        minKmsPerDay: 300,
        weddingCharge: 15000
      }
    ];

    await Tariff.insertMany(tariffsData);
    console.log('Tariff categories seeded.');

    console.log('Database Seeding Complete!');
    if (shouldClose) {
      await mongoose.connection.close();
      console.log('Seeding database connection closed.');
    }
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedData();
} else {
  module.exports = { seedData };
}
