const AMULog = require('../models/AMULog');

// @desc    Get system-wide AMU analytics for Admin Dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Only for Admin)
const getDashboardStats = async (req, res) => {
    try {
        // 1. City-Wise AMU Usage (To power the Heat Map / Safe Limits)
        const cityStats = await AMULog.aggregate([
            { 
                $group: { 
                    _id: "$city", 
                    totalPrescriptions: { $sum: 1 }, 
                    totalSpent: { $sum: "$totalBillAmount" } 
                } 
            },
            { $sort: { totalPrescriptions: -1 } } // Sort highest usage first
        ]);

        // 2. Medicine Comparison (To see which antibiotics are overused)
        const medicineStats = await AMULog.aggregate([
            { $unwind: "$dispensedMedicines" }, // Break apart the medicine arrays
            { 
                $group: { 
                    _id: "$dispensedMedicines.medicineName", 
                    timesPrescribed: { $sum: 1 } 
                } 
            },
            { $sort: { timesPrescribed: -1 } } // Sort most prescribed first
        ]);

        // 3. Overall System Summary
        const totalLogs = await AMULog.countDocuments();

        // Send all the data packaged perfectly for Frontend Chart.js / Recharts
        res.json({
            status: 'Success',
            overview: {
                totalAMURecords: totalLogs
            },
            cityData: cityStats,
            medicineData: medicineStats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };