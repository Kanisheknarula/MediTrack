const Treatment = require('../models/Treatment');
const AMULog = require('../models/AMULog');
const { buildAiReport } = require('../utils/aiReportEngine');

const getTreatmentFilter = (user) => {
    if (user.role === 'Farmer') return { farmer: user._id };
    if (user.role === 'Vet') return { vet: user._id };
    return {};
};

const getAMULogFilter = (user) => {
    if (user.role === 'Farmer') return { farmer: user._id };
    if (user.role === 'Pharmacist') return { pharmacist: user._id };
    return {};
};

const filterByCityForRole = (records, user) => {
    if (['Admin', 'Farmer', 'Vet'].includes(user.role)) return records;
    return records.filter((record) => record.farmer?.city === user.city);
};

const getAiReport = async (req, res) => {
    try {
        const treatments = await Treatment.find(getTreatmentFilter(req.user))
            .populate('farmer', 'name phoneNumber city')
            .populate('animal', 'animalId animalType breed')
            .populate('vet', 'name city')
            .sort({ updatedAt: 1 });

        const amuLogs = await AMULog.find(getAMULogFilter(req.user))
            .populate('farmer', 'name phoneNumber city')
            .populate('animal', 'animalId animalType breed')
            .populate('treatment')
            .sort({ createdAt: 1 });

        const report = buildAiReport({
            treatments: filterByCityForRole(treatments, req.user),
            amuLogs: filterByCityForRole(amuLogs, req.user),
            user: req.user
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAiReport };
