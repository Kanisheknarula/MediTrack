const cron = require('node-cron');
const Animal = require('../models/Animal');
const Notification = require('../models/Notification');

const startCronJobs = () => {
    // Schedule a job to run every day at Midnight (00:00)
    // The pattern '0 0 * * *' means: minute 0, hour 0, every day, every month, every year
    cron.schedule('0 0 * * *', async () => {
        console.log('Running 6-Month Animal Renewal Check...');

        try {
            // 1. Calculate the exact date 6 months ago
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            // 2. Find all 'Active' animals whose lastRenewedDate is older than or equal to 6 months ago
            const animalsNeedingRenewal = await Animal.find({
                status: 'Active',
                lastRenewedDate: { $lte: sixMonthsAgo } 
            });

            // 3. Loop through them and create a notification for their Farmer
            for (let animal of animalsNeedingRenewal) {
                // Check if a renewal notification already exists and is unread (to avoid spamming)
                const existingNotif = await Notification.findOne({
                    recipient: animal.farmer,
                    relatedAnimal: animal._id,
                    type: 'Renewal',
                    isRead: false
                });

                if (!existingNotif) {
                    await Notification.create({
                        recipient: animal.farmer,
                        message: `Time to renew registration for ${animal.animalType} (${animal.animalId}). Please confirm if the animal is still active.`,
                        type: 'Renewal',
                        relatedAnimal: animal._id
                    });
                    console.log(`Notification generated for Farmer ID: ${animal.farmer} regarding Animal: ${animal.animalId}`);
                }
            }
        } catch (error) {
            console.error('Error running renewal cron job:', error);
        }
    });

    console.log('Cron jobs initialized successfully.');
};

module.exports = startCronJobs;