const Treatment = require('../models/Treatment');
const Animal = require('../models/Animal');

// @desc    Create a new treatment request
// @route   POST /api/treatments/request
// @access  Private (Only for Farmers)
const createTreatmentRequest = async (req, res) => {
    try {
        const { animalId, symptomsDescription, imageUrl, voiceNoteUrl } = req.body;

        // 1. Verify the animal belongs to this specific logged-in farmer
        // (We use req.user._id because the 'protect' middleware gives us the logged-in user)
        const animal = await Animal.findOne({ 
            _id: animalId, 
            farmer: req.user._id 
        });

        if (!animal) {
            return res.status(404).json({ message: 'Animal not found or does not belong to you' });
        }

        // 2. Create the Treatment Ticket
        const treatment = await Treatment.create({
            farmer: req.user._id,
            animal: animal._id,
            symptomsDescription,
            imageUrl: imageUrl || '',
            voiceNoteUrl: voiceNoteUrl || ''
            // Note: 'status' automatically defaults to 'Pending'
            // 'vet' is left completely empty for now
        });

        res.status(201).json({
            message: 'Treatment request submitted successfully. Waiting for a Vet to accept.',
            treatment
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending treatments in the Vet's city
// @route   GET /api/treatments/pending
// @access  Private (Only for Vets)
// @desc    Get pending and accepted treatments in the Vet's city
// @route   GET /api/treatments/pending
// @access  Private (Only for Vets)
const getPendingTreatments = async (req, res) => {
    try {
        // Fetch cases that are either brand new (Pending) OR already accepted by THIS specific vet
        const treatments = await Treatment.find({
            $or: [
                { status: 'Pending' },
                { status: 'Accepted', vet: req.user._id }
            ]
        })
            .populate({
                path: 'farmer',
                match: { city: req.user.city }, // Only in the Vet's city
                select: 'name phoneNumber city address'
            })
            .populate('animal', 'animalId animalType breed age weight');

        // Filter out null farmers (from other cities)
        const nearbyTreatments = treatments.filter(t => t.farmer !== null);
        res.json(nearbyTreatments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept or Reject a treatment request
// @route   PUT /api/treatments/:id/respond
// @access  Private (Only for Vets)
// const respondToTreatment = async (req, res) => {
//     try {
//         const { status, rejectionReason } = req.body;
//         const treatmentId = req.params.id;

//         // Validation
//         if (!['Accepted', 'Rejected'].includes(status)) {
//             return res.status(400).json({ message: 'Status must be Accepted or Rejected' });
//         }
//         if (status === 'Rejected' && !rejectionReason) {
//             return res.status(400).json({ message: 'Please provide a reason for rejection' });
//         }

//         const treatment = await Treatment.findById(treatmentId);

//         if (!treatment) {
//             return res.status(404).json({ message: 'Treatment request not found' });
//         }
//         if (treatment.status !== 'Pending') {
//             return res.status(400).json({ message: 'This request has already been processed' });
//         }

//         // Update the ticket
//         treatment.status = status;
//         treatment.vet = req.user._id; // Lock this case to THIS specific Vet
        
//         if (status === 'Rejected') {
//             treatment.rejectionReason = rejectionReason;
//         }

//         await treatment.save();

//         res.json({ message: `Treatment securely marked as ${status}`, treatment });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const respondToTreatment = async (req, res) => {
    try {
        const { status } = req.body;
        const treatment = await Treatment.findById(req.params.id);

        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        // Update the status
        treatment.status = status;

        // Only assign the doctor to the case if they actually accepted it!
        if (status === 'Accepted') {
            treatment.vet = req.user._id;
        }

        await treatment.save();
        res.json(treatment);
    } catch (error) {
        // If the schema rejects it, this is where the 400 Bad Request comes from
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add prescription to an accepted treatment
// @route   PUT /api/treatments/:id/prescribe
// @access  Private (Only for Vets)
const addPrescription = async (req, res) => {
    try {
        const { prescriptionArray } = req.body;
        const treatmentId = req.params.id;

        const treatment = await Treatment.findById(treatmentId);

        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        // Security Check: Is the logged-in Vet the one who accepted this exact case?
        if (treatment.vet.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: 'Unauthorized. Only the Vet who accepted this case can prescribe medicine.' 
            });
        }

        // Logic Check: Can only prescribe if the case is currently 'Accepted'
        if (treatment.status !== 'Accepted') {
            return res.status(400).json({ 
                message: 'You can only add a prescription to an Accepted treatment.' 
            });
        }

        // Add the medicines and mark the Vet's portion of the workflow as Completed
        treatment.prescription = prescriptionArray;
        treatment.status = 'Completed'; 

        await treatment.save();

        res.json({ 
            message: 'Prescription submitted successfully. Forwarded to Farmer and Pharmacist.', 
            treatment 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in farmer's treatment requests
// @route   GET /api/treatments/my-requests
// @access  Private (Only for Farmers)
const getFarmerTreatments = async (req, res) => {
    try {
        // Find all treatments where the farmer matches the logged-in user
        const treatments = await Treatment.find({ farmer: req.user._id })
            .populate('animal', 'animalId animalType breed') // Bring in Animal details
            .populate('vet', 'name phoneNumber city')        // Bring in Vet details
            .sort({ createdAt: -1 });                        // Sort by newest first

        res.json(treatments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Vet's History (Completed or Rejected cases)
// @route   GET /api/treatments/vet-history
// @access  Private (Only for Vets)
const getVetHistory = async (req, res) => {
    try {
        const history = await Treatment.find({
            vet: req.user._id, // Only cases assigned to this specific doctor
            status: { $in: ['Completed', 'Rejected'] } 
        })
        .populate('farmer', 'name phoneNumber city')
        .populate('animal', 'animalId animalType breed');
        
        // Sort by newest first
        res.json(history.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// module.exports = { createTreatmentRequest };
module.exports = { 
    createTreatmentRequest, 
    getPendingTreatments, 
    respondToTreatment, addPrescription, getFarmerTreatments,getVetHistory
};
