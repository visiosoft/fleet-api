const schedule = require('node-schedule');
const db = require('../config/db');

// Store scheduled jobs
const scheduledJobs = new Map();

/**
 * Schedule a reminder for a note
 */
async function scheduleReminder(note) {
    if (!note.reminder || !note.reminder.date) return;

    // Cancel existing job if any
    if (scheduledJobs.has(note._id.toString())) {
        scheduledJobs.get(note._id.toString()).cancel();
        scheduledJobs.delete(note._id.toString());
    }

    const reminderDate = new Date(note.reminder.date);
    if (reminderDate <= new Date()) return;

    const job = schedule.scheduleJob(reminderDate, async () => {
        try {
            // Update note to mark reminder as sent
            const notes = await db.getCollection('notes');
            await notes.updateOne(
                { _id: note._id },
                { 
                    $set: { 
                        'reminder.sent': true,
                        updatedAt: new Date()
                    }
                }
            );

            // Remove job from scheduled jobs
            scheduledJobs.delete(note._id.toString());
        } catch (error) {
            console.error('Error processing reminder:', error);
        }
    });

    scheduledJobs.set(note._id.toString(), job);
}

/**
 * Initialize reminder scheduler for existing notes
 */
async function initializeReminderScheduler() {
    try {
        const notes = await db.getCollection('notes');
        const notesWithReminders = await notes.find({
            'reminder.date': { $exists: true },
            'reminder.sent': { $ne: true }
        }).toArray();

        for (const note of notesWithReminders) {
            await scheduleReminder(note);
        }
    } catch (error) {
        console.error('Error initializing reminder scheduler:', error);
    }
}

module.exports = {
    scheduleReminder,
    initializeReminderScheduler
}; 