const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Animal = require('../models/Animal');
const Treatment = require('../models/Treatment');
const AMULog = require('../models/AMULog');
const Notification = require('../models/Notification');

dotenv.config();

const DEMO_PASSWORD = 'Meditrack123!';

const daysAgo = (days, hour = 10) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, 0, 0, 0);
    return date;
};

const users = [
    { key: 'admin', name: 'System Admin', phoneNumber: '9000000001', role: 'Admin', city: 'Bhopal', address: 'Meditrack Command Center' },
    { key: 'registrar', name: 'District Registrar', phoneNumber: '9000000002', role: 'Registrar', city: 'Bhopal', address: 'Government Secretariat' },
    { key: 'vetA', name: 'Dr. Sharma', phoneNumber: '9000000003', role: 'Vet', city: 'Bhopal', address: 'Bhopal Veterinary Clinic' },
    { key: 'vetB', name: 'Dr. Iqbal', phoneNumber: '9000000004', role: 'Vet', city: 'Indore', address: 'Indore Animal Care' },
    { key: 'pharmacistA', name: 'MediCare Pharmacy', phoneNumber: '9000000005', role: 'Pharmacist', city: 'Bhopal', address: 'Bhopal Main Market' },
    { key: 'pharmacistB', name: 'Rural Health Pharmacy', phoneNumber: '9000000006', role: 'Pharmacist', city: 'Indore', address: 'Indore Dairy Road' },
    { key: 'farmerA', name: 'Ram Kaka', phoneNumber: '9000000007', role: 'Farmer', city: 'Bhopal', address: 'Village Pipaliya' },
    { key: 'farmerB', name: 'Suresh Patel', phoneNumber: '9000000008', role: 'Farmer', city: 'Indore', address: 'Village Sanwer' },
    { key: 'farmerC', name: 'Meena Bai', phoneNumber: '9000000009', role: 'Farmer', city: 'Gwalior', address: 'Village Morar' },
    { key: 'farmerD', name: 'Rafiq Khan', phoneNumber: '9000000010', role: 'Farmer', city: 'Jabalpur', address: 'Village Bargi' },
    { key: 'farmerE', name: 'Anita Verma', phoneNumber: '9000000011', role: 'Farmer', city: 'Ujjain', address: 'Village Nagda' },
];

const animals = [
    { key: 'cowA', farmer: 'farmerA', animalId: 'MT-ANI-2026-0001', animalType: 'Cow', breed: 'Gir', age: 36, weight: 450, group: 'Herd A', status: 'Active', lastRenewedDate: daysAgo(12) },
    { key: 'buffaloA', farmer: 'farmerA', animalId: 'MT-ANI-2026-0002', animalType: 'Buffalo', breed: 'Murrah', age: 42, weight: 520, group: 'Herd A', status: 'Active', lastRenewedDate: daysAgo(9) },
    { key: 'cowB', farmer: 'farmerB', animalId: 'MT-ANI-2026-0003', animalType: 'Cow', breed: 'Local Cross', age: 28, weight: 390, group: 'Indore Dairy', status: 'Active', lastRenewedDate: daysAgo(18) },
    { key: 'goatA', farmer: 'farmerB', animalId: 'MT-ANI-2026-0004', animalType: 'Goat', breed: 'Jamunapari', age: 16, weight: 54, group: 'Small Ruminants', status: 'Active', lastRenewedDate: daysAgo(21) },
    { key: 'cowC', farmer: 'farmerC', animalId: 'MT-ANI-2026-0005', animalType: 'Cow', breed: 'Sahiwal', age: 30, weight: 410, group: 'Gwalior Herd', status: 'Active', lastRenewedDate: daysAgo(15) },
    { key: 'buffaloB', farmer: 'farmerD', animalId: 'MT-ANI-2026-0006', animalType: 'Buffalo', breed: 'Nili Ravi', age: 48, weight: 560, group: 'Milk Line', status: 'Active', lastRenewedDate: daysAgo(7) },
    { key: 'cowD', farmer: 'farmerE', animalId: 'MT-ANI-2026-0007', animalType: 'Cow', breed: 'Tharparkar', age: 34, weight: 430, group: 'Ujjain Herd', status: 'Active', lastRenewedDate: daysAgo(6) },
    { key: 'calfA', farmer: 'farmerA', animalId: 'MT-ANI-2026-0008', animalType: 'Calf', breed: 'Gir Cross', age: 8, weight: 120, group: 'Herd A', status: 'Active', lastRenewedDate: daysAgo(3) },
];

const treatments = [
    {
        key: 'treatmentA',
        farmer: 'farmerA',
        animal: 'cowA',
        vet: 'vetA',
        symptomsDescription: 'High fever, reduced milk output, and low appetite for two days.',
        status: 'Completed',
        prescription: [
            { medicineName: 'Amoxicillin', dosage: '500mg twice daily morning and night', withdrawalPeriodDays: 7, notes: 'Give after feeding.' },
            { medicineName: 'Meloxicam', dosage: 'Once daily afternoon', withdrawalPeriodDays: 3, notes: 'Monitor temperature.' },
        ],
        billGenerated: true,
        date: daysAgo(18, 9),
    },
    {
        key: 'treatmentB',
        farmer: 'farmerA',
        animal: 'buffaloA',
        vet: 'vetA',
        symptomsDescription: 'Swelling near udder with mild fever and discomfort while milking.',
        status: 'Completed',
        prescription: [
            { medicineName: 'Ceftiofur', dosage: '1 injection daily night', withdrawalPeriodDays: 5, notes: 'Avoid milk sale during withdrawal period.' },
        ],
        billGenerated: true,
        date: daysAgo(14, 11),
    },
    {
        key: 'treatmentC',
        farmer: 'farmerB',
        animal: 'cowB',
        vet: 'vetB',
        symptomsDescription: 'Coughing, nasal discharge, and weakness after weather change.',
        status: 'Completed',
        prescription: [
            { medicineName: 'Oxytetracycline', dosage: 'Twice daily morning and night', withdrawalPeriodDays: 6, notes: 'Keep animal warm.' },
        ],
        billGenerated: true,
        date: daysAgo(11, 10),
    },
    {
        key: 'treatmentD',
        farmer: 'farmerC',
        animal: 'cowC',
        vet: 'vetA',
        symptomsDescription: 'Limping and reluctance to stand after grazing.',
        status: 'Completed',
        prescription: [
            { medicineName: 'Paracetamol', dosage: 'Once daily afternoon', withdrawalPeriodDays: 2, notes: 'Restrict movement.' },
        ],
        billGenerated: true,
        date: daysAgo(8, 12),
    },
    {
        key: 'treatmentE',
        farmer: 'farmerD',
        animal: 'buffaloB',
        vet: 'vetA',
        symptomsDescription: 'Digestive upset and repeated loose motion since morning.',
        status: 'Completed',
        prescription: [
            { medicineName: 'Probiotic Mix', dosage: 'Thrice daily morning afternoon night', withdrawalPeriodDays: 0, notes: 'Give with clean water.' },
        ],
        billGenerated: true,
        date: daysAgo(6, 14),
    },
    {
        key: 'treatmentF',
        farmer: 'farmerE',
        animal: 'cowD',
        vet: 'vetA',
        symptomsDescription: 'Minor wound on rear leg with swelling.',
        status: 'Completed',
        prescription: [
            { medicineName: 'Povidone Iodine', dosage: 'Apply twice daily morning and night', withdrawalPeriodDays: 0, notes: 'Clean wound before applying.' },
        ],
        billGenerated: true,
        date: daysAgo(4, 10),
    },
    {
        key: 'treatmentG',
        farmer: 'farmerA',
        animal: 'calfA',
        vet: 'vetA',
        symptomsDescription: 'Calf has mild dehydration and low activity.',
        status: 'Completed',
        prescription: [
            { medicineName: 'ORS Veterinary Mix', dosage: 'Thrice daily morning afternoon night', withdrawalPeriodDays: 0, notes: 'Small frequent doses.' },
        ],
        billGenerated: false,
        date: daysAgo(2, 10),
    },
    {
        key: 'treatmentH',
        farmer: 'farmerB',
        animal: 'goatA',
        vet: 'vetB',
        symptomsDescription: 'Goat has reduced appetite and slight fever.',
        status: 'Accepted',
        prescription: [],
        billGenerated: false,
        date: daysAgo(1, 15),
    },
    {
        key: 'treatmentI',
        farmer: 'farmerA',
        animal: 'buffaloA',
        symptomsDescription: 'Sudden drop in feed intake; farmer requests urgent vet visit.',
        status: 'Pending',
        prescription: [],
        billGenerated: false,
        date: daysAgo(0, 8),
    },
];

const amuLogs = [
    { treatment: 'treatmentA', pharmacist: 'pharmacistA', farmer: 'farmerA', animal: 'cowA', city: 'Bhopal', totalBillAmount: 570, dispensedMedicines: [{ medicineName: 'Amoxicillin', quantityOrMg: '10 tablets', price: 360 }, { medicineName: 'Meloxicam', quantityOrMg: '5 tablets', price: 210 }] },
    { treatment: 'treatmentB', pharmacist: 'pharmacistA', farmer: 'farmerA', animal: 'buffaloA', city: 'Bhopal', totalBillAmount: 620, dispensedMedicines: [{ medicineName: 'Ceftiofur', quantityOrMg: '5 injections', price: 620 }] },
    { treatment: 'treatmentC', pharmacist: 'pharmacistB', farmer: 'farmerB', animal: 'cowB', city: 'Indore', totalBillAmount: 480, dispensedMedicines: [{ medicineName: 'Oxytetracycline', quantityOrMg: '8 tablets', price: 480 }] },
    { treatment: 'treatmentD', pharmacist: 'pharmacistA', farmer: 'farmerC', animal: 'cowC', city: 'Gwalior', totalBillAmount: 160, dispensedMedicines: [{ medicineName: 'Paracetamol', quantityOrMg: '4 tablets', price: 160 }] },
    { treatment: 'treatmentE', pharmacist: 'pharmacistA', farmer: 'farmerD', animal: 'buffaloB', city: 'Jabalpur', totalBillAmount: 300, dispensedMedicines: [{ medicineName: 'Probiotic Mix', quantityOrMg: '6 sachets', price: 300 }] },
    { treatment: 'treatmentF', pharmacist: 'pharmacistA', farmer: 'farmerE', animal: 'cowD', city: 'Ujjain', totalBillAmount: 220, dispensedMedicines: [{ medicineName: 'Povidone Iodine', quantityOrMg: '1 bottle', price: 220 }] },
];

const notifications = [
    { recipient: 'farmerA', relatedAnimal: 'cowA', type: 'SystemAlert', message: 'Night dose reminder for MT-ANI-2026-0001.' },
    { recipient: 'farmerA', relatedAnimal: 'buffaloA', type: 'TreatmentUpdate', message: 'Prescription completed for MT-ANI-2026-0002.' },
    { recipient: 'vetA', relatedAnimal: 'buffaloA', type: 'TreatmentUpdate', message: 'New pending case assigned in Bhopal.' },
    { recipient: 'registrar', relatedAnimal: 'cowA', type: 'Renewal', message: 'Animal renewal check due for MT-ANI-2026-0001.' },
    { recipient: 'admin', type: 'SystemAlert', message: 'Meditrack demo analytics data is available.' },
];

const setTimestamps = async (Model, id, date) => {
    await Model.updateOne(
        { _id: id },
        { $set: { createdAt: date, updatedAt: date } },
        { timestamps: false }
    );
};

const upsertUsers = async () => {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    const map = {};

    for (const user of users) {
        const doc = await User.findOneAndUpdate(
            { phoneNumber: user.phoneNumber },
            {
                $set: {
                    name: user.name,
                    role: user.role,
                    city: user.city,
                    address: user.address,
                    password: hashedPassword,
                },
            },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        map[user.key] = doc;
    }

    return map;
};

const upsertAnimals = async (userMap) => {
    const map = {};

    for (const animal of animals) {
        const doc = await Animal.findOneAndUpdate(
            { animalId: animal.animalId },
            {
                $set: {
                    farmer: userMap[animal.farmer]._id,
                    animalType: animal.animalType,
                    breed: animal.breed,
                    age: animal.age,
                    weight: animal.weight,
                    group: animal.group,
                    status: animal.status,
                    registeredBy: userMap.registrar._id,
                    lastRenewedDate: animal.lastRenewedDate,
                },
            },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        map[animal.key] = doc;
        await setTimestamps(Animal, doc._id, animal.lastRenewedDate);
    }

    return map;
};

const upsertTreatments = async (userMap, animalMap) => {
    const map = {};

    for (const treatment of treatments) {
        const set = {
            farmer: userMap[treatment.farmer]._id,
            animal: animalMap[treatment.animal]._id,
            symptomsDescription: treatment.symptomsDescription,
            imageUrl: '',
            voiceNoteUrl: '',
            status: treatment.status,
            prescription: treatment.prescription,
            billGenerated: treatment.billGenerated,
            rejectionReason: treatment.rejectionReason || '',
        };

        const update = { $set: set };

        if (treatment.vet) {
            update.$set.vet = userMap[treatment.vet]._id;
        } else {
            update.$unset = { vet: '' };
        }

        const doc = await Treatment.findOneAndUpdate(
            {
                farmer: userMap[treatment.farmer]._id,
                animal: animalMap[treatment.animal]._id,
                symptomsDescription: treatment.symptomsDescription,
            },
            update,
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        map[treatment.key] = doc;
        await setTimestamps(Treatment, doc._id, treatment.date);
    }

    return map;
};

const upsertAMULogs = async (userMap, animalMap, treatmentMap) => {
    for (const log of amuLogs) {
        const doc = await AMULog.findOneAndUpdate(
            {
                treatment: treatmentMap[log.treatment]._id,
                pharmacist: userMap[log.pharmacist]._id,
            },
            {
                $set: {
                    treatment: treatmentMap[log.treatment]._id,
                    pharmacist: userMap[log.pharmacist]._id,
                    farmer: userMap[log.farmer]._id,
                    animal: animalMap[log.animal]._id,
                    city: log.city,
                    dispensedMedicines: log.dispensedMedicines,
                    totalBillAmount: log.totalBillAmount,
                },
            },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        await setTimestamps(AMULog, doc._id, treatmentMap[log.treatment].updatedAt || new Date());
    }
};

const upsertNotifications = async (userMap, animalMap) => {
    for (const notification of notifications) {
        await Notification.findOneAndUpdate(
            {
                recipient: userMap[notification.recipient]._id,
                message: notification.message,
                type: notification.type,
            },
            {
                $set: {
                    recipient: userMap[notification.recipient]._id,
                    message: notification.message,
                    type: notification.type,
                    relatedAnimal: notification.relatedAnimal ? animalMap[notification.relatedAnimal]._id : undefined,
                    isRead: false,
                },
            },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
    }
};

const seed = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing. Check server/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const userMap = await upsertUsers();
    const animalMap = await upsertAnimals(userMap);
    const treatmentMap = await upsertTreatments(userMap, animalMap);
    await upsertAMULogs(userMap, animalMap, treatmentMap);
    await upsertNotifications(userMap, animalMap);

    console.log('Meditrack demo data seeded successfully.');
    console.log(`Demo password for all seeded accounts: ${DEMO_PASSWORD}`);
    console.table(users.map(({ name, phoneNumber, role, city }) => ({ name, phoneNumber, role, city })));
};

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
