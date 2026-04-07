const TIME_SLOTS = ['morning', 'afternoon', 'night'];

const demoEvents = [
    ['2026-04-01', 'morning', 'Amoxicillin', true],
    ['2026-04-01', 'afternoon', 'Amoxicillin', true],
    ['2026-04-01', 'night', 'Amoxicillin', false],
    ['2026-04-02', 'morning', 'Amoxicillin', true],
    ['2026-04-02', 'afternoon', 'Amoxicillin', true],
    ['2026-04-02', 'night', 'Amoxicillin', false],
    ['2026-04-03', 'morning', 'Meloxicam', true],
    ['2026-04-03', 'afternoon', 'Meloxicam', true],
    ['2026-04-03', 'night', 'Meloxicam', true],
    ['2026-04-04', 'morning', 'Ceftiofur', true],
    ['2026-04-04', 'afternoon', 'Ceftiofur', false],
    ['2026-04-04', 'night', 'Ceftiofur', false],
    ['2026-04-05', 'morning', 'Ceftiofur', true],
    ['2026-04-05', 'afternoon', 'Ceftiofur', true],
    ['2026-04-05', 'night', 'Ceftiofur', false],
    ['2026-04-06', 'morning', 'Amoxicillin', true],
    ['2026-04-06', 'afternoon', 'Amoxicillin', true],
    ['2026-04-06', 'night', 'Amoxicillin', true],
].map(([date, timeSlot, medicineName, taken]) => ({ date, timeSlot, medicineName, taken }));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const round = (value, digits = 0) => {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
};

const hashString = (value = '') => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const classifyAdherence = (percentage) => {
    if (percentage >= 85) return 'High';
    if (percentage >= 60) return 'Medium';
    return 'Low';
};

const classifyHealth = (score) => {
    if (score >= 80) return 'Healthy';
    if (score >= 55) return 'Moderate';
    return 'Critical';
};

const classifyRisk = (probability) => {
    if (probability >= 65) return 'High';
    if (probability >= 35) return 'Medium';
    return 'Low';
};

const getSlotsFromDosage = (dosage = '', fallbackSeed = '') => {
    const value = dosage.toLowerCase();

    if (value.includes('morning') || value.includes('afternoon') || value.includes('night')) {
        return TIME_SLOTS.filter((slot) => value.includes(slot));
    }

    if (value.includes('thrice') || value.includes('3')) return TIME_SLOTS;
    if (value.includes('twice') || value.includes('2')) return ['morning', 'night'];
    if (value.includes('night')) return ['night'];

    return [TIME_SLOTS[hashString(fallbackSeed) % TIME_SLOTS.length]];
};

const createEstimatedEvent = ({ baseDate, treatmentId, medicineName, dosage, dayIndex }) => {
    const slots = getSlotsFromDosage(dosage, `${treatmentId}-${medicineName}-${dayIndex}`);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayIndex);

    return slots.map((timeSlot) => {
        const missHash = hashString(`${treatmentId}-${medicineName}-${dayIndex}-${timeSlot}`) % 100;
        let missRisk = 18;

        if (timeSlot === 'night') missRisk += 12;
        if (dayIndex % 6 === 0) missRisk += 4;
        if ((dosage || '').toLowerCase().includes('daily')) missRisk -= 4;

        return {
            date: date.toISOString().slice(0, 10),
            timeSlot,
            medicineName: medicineName || 'Unknown medicine',
            taken: missHash >= missRisk
        };
    });
};

const buildEventsFromTreatments = (treatments = []) => {
    const events = [];

    treatments.forEach((treatment) => {
        if (!treatment.prescription || treatment.prescription.length === 0) return;

        treatment.prescription.forEach((medicine) => {
            const days = clamp(Number(medicine.withdrawalPeriodDays) || 7, 5, 14);
            for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
                events.push(...createEstimatedEvent({
                    baseDate: treatment.updatedAt || treatment.createdAt || new Date(),
                    treatmentId: String(treatment._id),
                    medicineName: medicine.medicineName,
                    dosage: medicine.dosage,
                    dayIndex
                }));
            }
        });
    });

    return events;
};

const buildEventsFromAMULogs = (amuLogs = []) => {
    const events = [];

    amuLogs.forEach((log) => {
        (log.dispensedMedicines || []).forEach((medicine) => {
            for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
                events.push(...createEstimatedEvent({
                    baseDate: log.createdAt || new Date(),
                    treatmentId: String(log._id),
                    medicineName: medicine.medicineName,
                    dosage: medicine.quantityOrMg,
                    dayIndex
                }));
            }
        });
    });

    return events;
};

const summarizeByTimeSlot = (events) => {
    const summary = TIME_SLOTS.reduce((acc, slot) => {
        acc[slot] = { missed: 0, total: 0 };
        return acc;
    }, {});

    events.forEach((event) => {
        if (!summary[event.timeSlot]) summary[event.timeSlot] = { missed: 0, total: 0 };
        summary[event.timeSlot].total += 1;
        if (!event.taken) summary[event.timeSlot].missed += 1;
    });

    return summary;
};

const getMostMissedTime = (missedByTime) => {
    return Object.entries(missedByTime)
        .sort((a, b) => b[1].missed - a[1].missed || b[1].total - a[1].total)[0]?.[0] || 'night';
};

const getMedicineWiseAnalysis = (events) => {
    const byMedicine = {};

    events.forEach((event) => {
        if (!byMedicine[event.medicineName]) {
            byMedicine[event.medicineName] = {
                medicineName: event.medicineName,
                taken: 0,
                missed: 0,
                total: 0
            };
        }

        byMedicine[event.medicineName].total += 1;
        if (event.taken) byMedicine[event.medicineName].taken += 1;
        else byMedicine[event.medicineName].missed += 1;
    });

    return Object.values(byMedicine)
        .map((item) => ({
            ...item,
            adherence: item.total ? round((item.taken / item.total) * 100) : 0
        }))
        .sort((a, b) => b.missed - a.missed || a.adherence - b.adherence)
        .slice(0, 6);
};

const getTrendAnalysis = (events) => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    const bucketSize = Math.max(1, Math.ceil(sorted.length / 4));
    const series = [];

    for (let index = 0; index < sorted.length; index += bucketSize) {
        const bucket = sorted.slice(index, index + bucketSize);
        const taken = bucket.filter((event) => event.taken).length;
        const total = bucket.length;
        const startDate = bucket[0]?.date;
        const endDate = bucket[bucket.length - 1]?.date;
        series.push({
            label: startDate === endDate ? startDate : `${startDate} to ${endDate}`,
            taken,
            total,
            adherence: total ? round((taken / total) * 100) : 0
        });
    }

    const first = series[0]?.adherence || 0;
    const last = series[series.length - 1]?.adherence || 0;
    const delta = round(last - first);
    const direction = delta > 5 ? 'Improving' : delta < -5 ? 'Declining' : 'Stable';

    return { direction, delta, series };
};

const getLongestMissedStreak = (events) => {
    let longest = 0;
    let current = 0;

    [...events].sort((a, b) => `${a.date}-${a.timeSlot}`.localeCompare(`${b.date}-${b.timeSlot}`))
        .forEach((event) => {
            if (event.taken) {
                current = 0;
                return;
            }
            current += 1;
            longest = Math.max(longest, current);
        });

    return longest;
};

const getRecommendations = ({ adherenceClass, mostMissedTime, riskLevel, trendDirection, worstMedicine }) => {
    const recommendations = [];

    if (mostMissedTime === 'night') {
        recommendations.push('Move the night-dose reminder earlier and pair it with a fixed routine like animal feeding or shed closing.');
    } else if (mostMissedTime === 'morning') {
        recommendations.push('Place the morning reminder before farm work starts so it is not skipped during the busy first hour.');
    } else {
        recommendations.push('Add an afternoon reminder because missed doses are clustering around midday.');
    }

    if (adherenceClass === 'Low') {
        recommendations.push('Use a two-step reminder: first alert for the farmer and second confirmation after the medicine is marked taken.');
    } else if (adherenceClass === 'Medium') {
        recommendations.push('Keep the same prescription plan, but add a daily checklist until adherence remains above 85 percent.');
    } else {
        recommendations.push('Adherence is strong. Continue the current routine and keep monitoring for sudden missed-dose spikes.');
    }

    if (riskLevel === 'High') {
        recommendations.push('Flag this case for follow-up because the predicted chance of missing future doses is high.');
    }

    if (trendDirection === 'Declining') {
        recommendations.push('Review the last few days of treatment because adherence is declining compared with earlier doses.');
    }

    if (worstMedicine) {
        recommendations.push(`Pay extra attention to ${worstMedicine.medicineName}, which has the highest missed-dose count.`);
    }

    recommendations.push('Do not change dosage without veterinarian approval.');

    return recommendations;
};

const getAiInsight = ({ adherenceClass, healthClass, mostMissedTime, trendDirection, riskLevel, worstMedicine }) => {
    const medicineNote = worstMedicine
        ? ` The medicine most often missed is ${worstMedicine.medicineName}.`
        : '';

    if (mostMissedTime === 'night') {
        return `The user tends to miss night medicines, which often happens when fatigue builds after the day routine. Adherence is currently ${adherenceClass.toLowerCase()}, health status is ${healthClass.toLowerCase()}, and future missed-dose risk is ${riskLevel.toLowerCase()}.${medicineNote}`;
    }

    if (trendDirection === 'Improving') {
        return `Adherence is improving over time, which suggests the treatment routine is becoming more consistent. The current health status is ${healthClass.toLowerCase()} and missed-dose risk is ${riskLevel.toLowerCase()}.${medicineNote}`;
    }

    if (trendDirection === 'Declining') {
        return `Adherence is declining compared with earlier doses. The system should trigger extra reminders because the predicted future missed-dose risk is ${riskLevel.toLowerCase()}.${medicineNote}`;
    }

    return `The medicine-taking pattern is mostly stable with the highest misses in the ${mostMissedTime}. Health status is ${healthClass.toLowerCase()} and the predicted missed-dose risk is ${riskLevel.toLowerCase()}.${medicineNote}`;
};

const sigmoid = (value) => 1 / (1 + Math.exp(-value));

const buildAiReport = ({ treatments = [], amuLogs = [], user = {} }) => {
    let events = buildEventsFromTreatments(treatments);
    let dataSource = events.length ? 'estimatedFromTreatmentHistory' : 'demoFallback';

    if (!events.length) {
        events = buildEventsFromAMULogs(amuLogs);
        dataSource = events.length ? 'estimatedFromBillingHistory' : 'demoFallback';
    }

    if (!events.length) {
        events = demoEvents;
    }

    const taken = events.filter((event) => event.taken).length;
    const total = events.length;
    const adherencePercentage = total ? round((taken / total) * 100) : 0;
    const adherenceClass = classifyAdherence(adherencePercentage);
    const missedByTime = summarizeByTimeSlot(events);
    const mostMissedTime = getMostMissedTime(missedByTime);
    const medicineWise = getMedicineWiseAnalysis(events);
    const trend = getTrendAnalysis(events);
    const longestMissedStreak = getLongestMissedStreak(events);
    const consistencyScore = clamp(100 - (longestMissedStreak * 8), 0, 100);
    const trendScore = trend.direction === 'Improving' ? 95 : trend.direction === 'Declining' ? 55 : 78;
    const healthScoreValue = round((adherencePercentage * 0.65) + (consistencyScore * 0.25) + (trendScore * 0.10));
    const healthClass = classifyHealth(healthScoreValue);
    const worstMedicine = medicineWise.find((item) => item.missed > 0);

    const missRate = 1 - (adherencePercentage / 100);
    const nightMissShare = missedByTime.night.total ? missedByTime.night.missed / missedByTime.night.total : 0;
    const consistencyPenalty = 1 - (consistencyScore / 100);
    const trendPenalty = trend.direction === 'Declining' ? 0.45 : trend.direction === 'Improving' ? -0.25 : 0;
    const medicinePenalty = worstMedicine && worstMedicine.adherence < 60 ? 0.35 : 0;
    const modelScore = -1.35 + (2.4 * missRate) + (0.8 * nightMissShare) + (1.2 * consistencyPenalty) + trendPenalty + medicinePenalty;
    const riskProbability = round(sigmoid(modelScore) * 100);
    const riskLevel = classifyRisk(riskProbability);

    return {
        status: 'Success',
        generatedAt: new Date().toISOString(),
        scope: {
            userId: user._id,
            name: user.name,
            role: user.role,
            city: user.city,
            dataSource
        },
        adherence: {
            formula: '(taken / total) * 100',
            taken,
            total,
            percentage: adherencePercentage,
            classification: adherenceClass
        },
        healthScore: {
            score: healthScoreValue,
            classification: healthClass,
            explanation: 'Score combines adherence percentage, missed-dose consistency, and recent trend.'
        },
        patternDetection: {
            method: 'Time-slot clustering by missed-dose frequency',
            mostMissedTime,
            missedByTime
        },
        patternInsight: getAiInsight({
            adherenceClass,
            healthClass,
            mostMissedTime,
            trendDirection: trend.direction,
            riskLevel,
            worstMedicine
        }),
        smartRecommendations: getRecommendations({
            adherenceClass,
            mostMissedTime,
            riskLevel,
            trendDirection: trend.direction,
            worstMedicine
        }),
        riskPrediction: {
            model: 'Logistic regression style risk model',
            probability: riskProbability,
            classification: riskLevel,
            drivers: [
                `Miss rate: ${round(missRate * 100)} percent`,
                `Night miss pressure: ${round(nightMissShare * 100)} percent`,
                `Consistency penalty: ${round(consistencyPenalty * 100)} percent`,
                `Trend: ${trend.direction}`
            ]
        },
        trendAnalysis: trend,
        medicineWiseAnalysis: medicineWise,
        consistency: {
            score: consistencyScore,
            longestMissedStreak
        }
    };
};

module.exports = { buildAiReport };
