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
const DEMO_PHONE_PREFIX = '90000000';

const pad = (value, length = 2) => String(value).padStart(length, '0');
const phone = (index) => `${DEMO_PHONE_PREFIX}${pad(index)}`;

const daysAgo = (days, hour = 10) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, 0, 0, 0);
    return date;
};

const cities = [
    'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar',
    'Rewa', 'Satna', 'Dewas', 'Ratlam', 'Chhindwara', 'Vidisha',
    'Sehore', 'Mandsaur', 'Hoshangabad', 'Morena', 'Khandwa', 'Betul',
];

const doctorNames = [
    'Dr. Sharma', 'Dr. Iqbal', 'Dr. Mehta', 'Dr. Nair', 'Dr. Soni', 'Dr. Ansari',
    'Dr. Kulkarni', 'Dr. Thomas', 'Dr. Saxena', 'Dr. Khan', 'Dr. Jain', 'Dr. Verma',
    'Dr. Rajput', 'Dr. Pawar', 'Dr. Chaturvedi', 'Dr. Mishra', 'Dr. Das', 'Dr. Ali',
];

const farmerNames = [
    'Ram Kaka', 'Kiran Lodhi', 'Suresh Patel', 'Neha Chouhan', 'Meena Bai', 'Arvind Gurjar',
    'Rafiq Khan', 'Pooja Ahirwar', 'Anita Verma', 'Vikram Parmar', 'Harish Yadav', 'Lata Kushwaha',
    'Mohan Singh', 'Rani Dhakad', 'Bhola Ahir', 'Asha Parmar', 'Nitesh Rai', 'Savita Yadav',
    'Gopal Kushwah', 'Sunita Thakur', 'Mahesh Kirar', 'Rukmini Patel', 'Kamlesh Sahu', 'Farida Bee',
    'Dinesh Lodhi', 'Preeti Rajput', 'Sanjay Pawar', 'Geeta Vishwakarma', 'Nirmal Rathore', 'Kavita Sen',
    'Ramesh Ahirwar', 'Maya Bai', 'Lakhan Meena', 'Pushpa Gurjar', 'Iqbal Mansuri', 'Suman Kol',
    'Devendra Patel', 'Bharti Soni', 'Prakash Verma', 'Rekha Yadav', 'Jagdish Kushwah', 'Mamta Sharma',
];

const medicineCatalog = [
    { medicineName: 'Amoxicillin', dosage: '500mg twice daily morning and night', withdrawalPeriodDays: 7, quantityOrMg: '10 tablets', price: 360, notes: 'Give after feeding and observe milk withdrawal.' },
    { medicineName: 'Meloxicam', dosage: 'Once daily afternoon', withdrawalPeriodDays: 3, quantityOrMg: '5 tablets', price: 210, notes: 'Monitor temperature and pain response.' },
    { medicineName: 'Ceftiofur', dosage: '1 injection daily night', withdrawalPeriodDays: 5, quantityOrMg: '5 injections', price: 620, notes: 'Maintain cold-chain storage before use.' },
    { medicineName: 'Oxytetracycline', dosage: 'Twice daily morning and night', withdrawalPeriodDays: 6, quantityOrMg: '8 tablets', price: 480, notes: 'Keep animal warm and hydrated.' },
    { medicineName: 'Paracetamol', dosage: 'Once daily afternoon', withdrawalPeriodDays: 2, quantityOrMg: '4 tablets', price: 160, notes: 'Use only for the prescribed duration.' },
    { medicineName: 'Probiotic Mix', dosage: 'Thrice daily morning afternoon night', withdrawalPeriodDays: 0, quantityOrMg: '6 sachets', price: 300, notes: 'Give with clean water.' },
    { medicineName: 'ORS Veterinary Mix', dosage: 'Thrice daily morning afternoon night', withdrawalPeriodDays: 0, quantityOrMg: '8 sachets', price: 260, notes: 'Small frequent doses are recommended.' },
    { medicineName: 'Povidone Iodine', dosage: 'Apply twice daily morning and night', withdrawalPeriodDays: 0, quantityOrMg: '1 bottle', price: 220, notes: 'Clean wound before applying.' },
    { medicineName: 'Vitamin B Complex', dosage: 'Once daily morning', withdrawalPeriodDays: 0, quantityOrMg: '1 vial', price: 180, notes: 'Continue with normal feeding routine.' },
    { medicineName: 'Enrofloxacin', dosage: 'Once daily night', withdrawalPeriodDays: 8, quantityOrMg: '6 tablets', price: 540, notes: 'Strictly follow withdrawal guidance.' },
    { medicineName: 'Fenbendazole', dosage: 'Once daily morning', withdrawalPeriodDays: 4, quantityOrMg: '3 boluses', price: 240, notes: 'Deworming course as prescribed.' },
    { medicineName: 'Calcium Gel', dosage: 'Twice daily morning and night', withdrawalPeriodDays: 0, quantityOrMg: '2 tubes', price: 300, notes: 'Give after milking if possible.' },
    { medicineName: 'Metronidazole', dosage: 'Twice daily morning and night', withdrawalPeriodDays: 5, quantityOrMg: '8 tablets', price: 340, notes: 'Complete the full course.' },
    { medicineName: 'Ringer Lactate', dosage: 'Once daily afternoon', withdrawalPeriodDays: 0, quantityOrMg: '1 bottle', price: 190, notes: 'Administer under supervision.' },
    { medicineName: 'Ivermectin', dosage: 'Once daily morning', withdrawalPeriodDays: 4, quantityOrMg: '1 injection', price: 280, notes: 'Parasite control as directed.' },
    { medicineName: 'Tylosin', dosage: 'Once daily night', withdrawalPeriodDays: 6, quantityOrMg: '5 injections', price: 590, notes: 'Use under vet supervision.' },
    { medicineName: 'Doxycycline', dosage: 'Twice daily morning and night', withdrawalPeriodDays: 5, quantityOrMg: '8 tablets', price: 420, notes: 'Complete the course.' },
    { medicineName: 'Ketoprofen', dosage: 'Once daily afternoon', withdrawalPeriodDays: 2, quantityOrMg: '4 tablets', price: 260, notes: 'Watch for pain relief.' },
    { medicineName: 'Chlorpheniramine', dosage: 'Once daily night', withdrawalPeriodDays: 1, quantityOrMg: '5 tablets', price: 120, notes: 'For allergy-like symptoms only.' },
    { medicineName: 'Mineral Mixture', dosage: 'Once daily morning', withdrawalPeriodDays: 0, quantityOrMg: '1 pack', price: 240, notes: 'Mix with feed.' },
    { medicineName: 'Liver Tonic', dosage: 'Twice daily morning and night', withdrawalPeriodDays: 0, quantityOrMg: '1 bottle', price: 310, notes: 'Use after feeding.' },
    { medicineName: 'Electrolyte Powder', dosage: 'Thrice daily morning afternoon night', withdrawalPeriodDays: 0, quantityOrMg: '10 sachets', price: 260, notes: 'Support hydration.' },
    { medicineName: 'Mastitis Tube', dosage: 'Once daily night', withdrawalPeriodDays: 7, quantityOrMg: '4 tubes', price: 650, notes: 'Follow milk withdrawal rule.' },
    { medicineName: 'Neomycin', dosage: 'Twice daily morning and night', withdrawalPeriodDays: 6, quantityOrMg: '8 tablets', price: 390, notes: 'Complete full prescribed course.' },
    { medicineName: 'Zinc Oxide Ointment', dosage: 'Apply twice daily morning and night', withdrawalPeriodDays: 0, quantityOrMg: '1 tube', price: 150, notes: 'Clean area before applying.' },
    { medicineName: 'Bloat Relief Drops', dosage: 'Once daily afternoon', withdrawalPeriodDays: 0, quantityOrMg: '1 bottle', price: 230, notes: 'Monitor feed intake.' },
    { medicineName: 'Antiseptic Spray', dosage: 'Apply twice daily morning and night', withdrawalPeriodDays: 0, quantityOrMg: '1 spray', price: 210, notes: 'Avoid direct eye contact.' },
    { medicineName: 'Iron Dextran', dosage: 'Once daily morning', withdrawalPeriodDays: 0, quantityOrMg: '1 injection', price: 300, notes: 'Use for weakness support.' },
    { medicineName: 'Sodium Bicarbonate', dosage: 'Once daily afternoon', withdrawalPeriodDays: 0, quantityOrMg: '1 pack', price: 170, notes: 'Support digestive balance.' },
    { medicineName: 'Multivitamin Bolus', dosage: 'Once daily morning', withdrawalPeriodDays: 0, quantityOrMg: '5 boluses', price: 270, notes: 'Use as nutritional support.' },
];

const symptomTemplates = [
    'high fever, reduced appetite, and dull behavior',
    'coughing, nasal discharge, and weakness after weather change',
    'swelling near udder with discomfort during milking',
    'digestive upset with loose motion since morning',
    'minor wound with swelling on rear leg',
    'low milk production and fatigue after feeding',
    'limping and reluctance to stand after grazing',
    'mild dehydration and low activity',
    'skin irritation with repeated scratching',
    'bloating and reduced water intake',
    'eye discharge with mild fever',
    'post-calving weakness and poor appetite',
    'suspected worm load with weight loss',
    'mastitis symptoms and reduced milk quality',
    'calf weakness with irregular feeding',
];

const animalTypes = [
    { animalType: 'Cow', breed: 'Gir', age: 36, weight: 450 },
    { animalType: 'Buffalo', breed: 'Murrah', age: 42, weight: 520 },
    { animalType: 'Cow', breed: 'Local Cross', age: 28, weight: 390 },
    { animalType: 'Goat', breed: 'Jamunapari', age: 16, weight: 54 },
    { animalType: 'Cow', breed: 'Sahiwal', age: 30, weight: 410 },
    { animalType: 'Buffalo', breed: 'Nili Ravi', age: 48, weight: 560 },
    { animalType: 'Cow', breed: 'Tharparkar', age: 34, weight: 430 },
    { animalType: 'Calf', breed: 'Gir Cross', age: 8, weight: 120 },
    { animalType: 'Cow', breed: 'Rathi', age: 32, weight: 405 },
    { animalType: 'Buffalo', breed: 'Mehsana', age: 46, weight: 535 },
];

let userIndex = 1;
const coreUsers = [
    { key: 'admin', name: 'System Admin', phoneNumber: phone(userIndex++), role: 'Admin', city: 'Bhopal', address: 'Meditrack Command Center' },
    { key: 'registrar', name: 'District Registrar', phoneNumber: phone(userIndex++), role: 'Registrar', city: 'Bhopal', address: 'Government Secretariat, Bhopal' },
];

const cityTeams = cities.map((city, index) => ({
    city,
    vetKey: `vet${index}`,
    pharmacistKey: `pharmacist${index}`,
    vet: { key: `vet${index}`, name: doctorNames[index], phoneNumber: phone(userIndex++), role: 'Vet', city, address: `${city} Veterinary Clinic` },
    pharmacist: { key: `pharmacist${index}`, name: `${city} Animal Pharmacy`, phoneNumber: phone(userIndex++), role: 'Pharmacist', city, address: `${city} Medicine Distribution Center` },
}));

const farmerUsers = farmerNames.map((name, index) => {
    const city = cities[index % cities.length];
    return {
        key: `farmer${index}`,
        name,
        phoneNumber: phone(userIndex++),
        role: 'Farmer',
        city,
        address: `Village Demo-${pad(index + 1, 3)}, ${city}`,
    };
});

const users = [
    ...coreUsers,
    ...cityTeams.flatMap((team) => [team.vet, team.pharmacist]),
    ...farmerUsers,
];

const teamByCity = cityTeams.reduce((acc, team) => {
    acc[team.city] = team;
    return acc;
}, {});

const animals = Array.from({ length: 100 }, (_, index) => {
    const farmer = farmerUsers[index % farmerUsers.length];
    const animal = animalTypes[index % animalTypes.length];
    return {
        key: `animal${index}`,
        farmer: farmer.key,
        animalId: `MT-ANI-2026-${pad(index + 1, 4)}`,
        animalType: animal.animalType,
        breed: animal.breed,
        age: animal.age + (index % 9),
        weight: animal.weight + ((index % 6) * 11),
        group: `${farmer.city} Herd ${1 + (index % 5)}`,
        status: index % 29 === 0 ? 'Inactive' : 'Active',
        lastRenewedDate: daysAgo(2 + (index % 120), 9),
        city: farmer.city,
    };
});

const treatments = Array.from({ length: 120 }, (_, index) => {
    const animal = animals[index % animals.length];
    const farmer = farmerUsers.find((item) => item.key === animal.farmer);
    const team = teamByCity[farmer.city];
    const primary = medicineCatalog[index % medicineCatalog.length];
    const secondary = medicineCatalog[(index + 7) % medicineCatalog.length];
    const includeSecondary = index % 3 === 0 || primary.withdrawalPeriodDays === 0;
    const status = index < 100 ? 'Completed' : index % 2 === 0 ? 'Pending' : 'Accepted';
    const prescription = status === 'Pending'
        ? []
        : [
            {
                medicineName: primary.medicineName,
                dosage: primary.dosage,
                withdrawalPeriodDays: primary.withdrawalPeriodDays,
                notes: primary.notes,
            },
            ...(includeSecondary ? [{
                medicineName: secondary.medicineName,
                dosage: secondary.dosage,
                withdrawalPeriodDays: secondary.withdrawalPeriodDays,
                notes: secondary.notes,
            }] : []),
        ];
    const dispensedMedicines = status === 'Completed'
        ? [
            {
                medicineName: primary.medicineName,
                quantityOrMg: primary.quantityOrMg,
                price: primary.price,
            },
            ...(includeSecondary ? [{
                medicineName: secondary.medicineName,
                quantityOrMg: secondary.quantityOrMg,
                price: secondary.price,
            }] : []),
        ]
        : [];

    return {
        key: `treatment${index}`,
        farmer: farmer.key,
        animal: animal.key,
        vet: status === 'Pending' ? undefined : team.vetKey,
        pharmacist: team.pharmacistKey,
        city: farmer.city,
        symptomsDescription: `Demo case ${pad(index + 1, 3)} for ${animal.animalId}: ${symptomTemplates[index % symptomTemplates.length]}.`,
        status,
        prescription,
        dispensedMedicines,
        billGenerated: status === 'Completed',
        date: daysAgo(100 - (index % 95), 8 + (index % 8)),
    };
});

const notifications = treatments.slice(0, 80).map((treatment, index) => ({
    recipient: index % 8 === 0
        ? 'admin'
        : treatment.status === 'Pending'
            ? teamByCity[treatment.city].vetKey
            : treatment.farmer,
    relatedAnimal: treatment.animal,
    type: index % 9 === 0 ? 'Renewal' : treatment.status === 'Completed' ? 'SystemAlert' : 'TreatmentUpdate',
    message: index % 9 === 0
        ? `Renewal check due for ${treatment.animal}.`
        : `Demo notification ${pad(index + 1, 3)} for ${treatment.key}.`,
}));

const setTimestamps = async (Model, id, date) => {
    await Model.updateOne(
        { _id: id },
        { $set: { createdAt: date, updatedAt: date } },
        { timestamps: false }
    );
};

const clearPreviousDemoData = async () => {
    const demoPhoneNumbers = users.map((user) => user.phoneNumber);
    const demoAnimalIds = animals.map((animal) => animal.animalId);
    const existingDemoUsers = await User.find({ phoneNumber: { $in: demoPhoneNumbers } }).select('_id');
    const existingDemoAnimals = await Animal.find({ animalId: { $in: demoAnimalIds } }).select('_id');
    const userIds = existingDemoUsers.map((user) => user._id);
    const animalIds = existingDemoAnimals.map((animal) => animal._id);

    await AMULog.deleteMany({
        $or: [
            { farmer: { $in: userIds } },
            { pharmacist: { $in: userIds } },
            { animal: { $in: animalIds } },
        ],
    });
    await Notification.deleteMany({
        $or: [
            { recipient: { $in: userIds } },
            { relatedAnimal: { $in: animalIds } },
            { message: /^Demo notification|^Renewal check due|^Meditrack demo analytics data|^Medicine reminder generated/i },
        ],
    });
    await Treatment.deleteMany({
        $or: [
            { farmer: { $in: userIds } },
            { vet: { $in: userIds } },
            { animal: { $in: animalIds } },
            { symptomsDescription: /^Demo case/i },
        ],
    });
    await Animal.deleteMany({
        $or: [
            { animalId: { $in: demoAnimalIds } },
            { farmer: { $in: userIds } },
        ],
    });
    await User.deleteMany({ phoneNumber: { $in: demoPhoneNumbers } });
};

const createUsers = async () => {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    const map = {};

    for (const user of users) {
        const doc = await User.findOneAndUpdate(
            { phoneNumber: user.phoneNumber },
            {
                $set: {
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    password: hashedPassword,
                    role: user.role,
                    city: user.city,
                    address: user.address,
                },
            },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        map[user.key] = doc;
    }

    return map;
};

const createAnimals = async (userMap) => {
    const map = {};

    for (const animal of animals) {
        const doc = await Animal.findOneAndUpdate(
            { animalId: animal.animalId },
            {
                $set: {
                    farmer: userMap[animal.farmer]._id,
                    animalId: animal.animalId,
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

const createTreatments = async (userMap, animalMap) => {
    const map = {};

    for (const treatment of treatments) {
        const update = {
            $set: {
                farmer: userMap[treatment.farmer]._id,
                animal: animalMap[treatment.animal]._id,
                symptomsDescription: treatment.symptomsDescription,
                imageUrl: '',
                voiceNoteUrl: '',
                status: treatment.status,
                prescription: treatment.prescription,
                billGenerated: treatment.billGenerated,
                rejectionReason: '',
            },
        };

        if (treatment.vet) {
            update.$set.vet = userMap[treatment.vet]._id;
        } else {
            update.$unset = { vet: '' };
        }

        const doc = await Treatment.findOneAndUpdate(
            { symptomsDescription: treatment.symptomsDescription },
            update,
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        map[treatment.key] = doc;
        await setTimestamps(Treatment, doc._id, treatment.date);
    }

    return map;
};

const createAMULogs = async (userMap, animalMap, treatmentMap) => {
    for (const treatment of treatments.filter((item) => item.billGenerated)) {
        const totalBillAmount = treatment.dispensedMedicines.reduce((total, medicine) => total + medicine.price, 0);
        const doc = await AMULog.findOneAndUpdate(
            {
                treatment: treatmentMap[treatment.key]._id,
                pharmacist: userMap[treatment.pharmacist]._id,
            },
            {
                $set: {
                    treatment: treatmentMap[treatment.key]._id,
                    pharmacist: userMap[treatment.pharmacist]._id,
                    farmer: userMap[treatment.farmer]._id,
                    animal: animalMap[treatment.animal]._id,
                    city: treatment.city,
                    dispensedMedicines: treatment.dispensedMedicines,
                    totalBillAmount,
                },
            },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        await setTimestamps(AMULog, doc._id, treatment.date);
    }
};

const createNotifications = async (userMap, animalMap) => {
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
    await clearPreviousDemoData();

    const userMap = await createUsers();
    const animalMap = await createAnimals(userMap);
    const treatmentMap = await createTreatments(userMap, animalMap);
    await createAMULogs(userMap, animalMap, treatmentMap);
    await createNotifications(userMap, animalMap);

    console.log('Meditrack large demo dataset seeded successfully.');
    console.log(`Demo password for all seeded accounts: ${DEMO_PASSWORD}`);
    console.table({
        users: users.length,
        uniqueCities: cities.length,
        doctors: cityTeams.length,
        pharmacists: cityTeams.length,
        farmers: farmerUsers.length,
        animals: animals.length,
        treatments: treatments.length,
        amuLogs: treatments.filter((item) => item.billGenerated).length,
        notifications: notifications.length,
        uniqueMedicines: medicineCatalog.length,
        prescriptionMedicineRows: treatments.reduce((total, treatment) => total + treatment.prescription.length, 0),
    });
    console.table(users.map(({ name, phoneNumber, role, city }) => ({ name, phoneNumber, role, city })).slice(0, 25));
    console.log(`Showing first 25 accounts above. Total seeded accounts: ${users.length}`);
};

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
