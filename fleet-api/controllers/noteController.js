const { ObjectId } = require('mongodb');
const db = require('../config/db');
const { scheduleReminder } = require('../services/reminderService');

const noteController = {
    /**
     * Get all notes
     */
    async getAllNotes(req, res) {
        try {
            // Get company ID from authenticated user
            const companyId = req.user.companyId;
            
            if (!companyId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Company ID not found in user token'
                });
            }
            
            console.log(`Fetching notes for company ID: ${companyId}`);
            
            const notes = await db.getCollection('notes');
            const result = await notes.find({ 
                companyId: companyId.toString() 
            }).sort({ createdAt: -1 }).toArray();
            
            console.log(`Found ${result.length} notes for company ${companyId}`);
            
            res.json({ notes: result });
        } catch (error) {
            console.error('Error getting notes:', error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Create a new note
     */
    async createNote(req, res) {
        try {
            // Get company ID from authenticated user
            const companyId = req.user.companyId;
            
            if (!companyId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Company ID not found in user token'
                });
            }
            
            console.log(`Creating note for company ID: ${companyId}`);
            
            const { title, content, category, priority, status, reminder } = req.body;

            // Validate required fields
            if (!title || !content || !category) {
                return res.status(400).json({ 
                    message: 'Title, content, and category are required' 
                });
            }

            // Validate priority and status
            if (priority && !['low', 'medium', 'high'].includes(priority)) {
                return res.status(400).json({ 
                    message: 'Priority must be low, medium, or high' 
                });
            }

            if (status && !['active', 'archived'].includes(status)) {
                return res.status(400).json({ 
                    message: 'Status must be active or archived' 
                });
            }

            // Validate reminder if provided
            if (reminder) {
                const reminderDate = new Date(reminder.date);
                if (isNaN(reminderDate.getTime())) {
                    return res.status(400).json({ 
                        message: 'Invalid reminder date' 
                    });
                }

                if (reminder.whatsappNumber && !/^\+?[1-9]\d{1,14}$/.test(reminder.whatsappNumber)) {
                    return res.status(400).json({ 
                        message: 'Invalid WhatsApp number format' 
                    });
                }
            }

            const notes = await db.getCollection('notes');
            const note = {
                title,
                content,
                category,
                priority: priority || 'medium',
                status: status || 'active',
                reminder: reminder || null,
                companyId: companyId.toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await notes.insertOne(note);
            const createdNote = await notes.findOne({ _id: result.insertedId });

            // Schedule reminder if provided
            if (reminder) {
                await scheduleReminder(createdNote);
            }
            
            console.log(`Note created with ID: ${result.insertedId}`);

            res.status(201).json(createdNote);
        } catch (error) {
            console.error('Error creating note:', error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Update a note
     */
    async updateNote(req, res) {
        try {
            // Get company ID from authenticated user
            const companyId = req.user.companyId;
            
            if (!companyId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Company ID not found in user token'
                });
            }
            
            const { id } = req.params;
            console.log(`Updating note ${id} for company ID: ${companyId}`);
            
            const { title, content, category, priority, status, reminder } = req.body;

            // Validate priority and status if provided
            if (priority && !['low', 'medium', 'high'].includes(priority)) {
                return res.status(400).json({ 
                    message: 'Priority must be low, medium, or high' 
                });
            }

            if (status && !['active', 'archived'].includes(status)) {
                return res.status(400).json({ 
                    message: 'Status must be active or archived' 
                });
            }

            // Validate reminder if provided
            if (reminder) {
                const reminderDate = new Date(reminder.date);
                if (isNaN(reminderDate.getTime())) {
                    return res.status(400).json({ 
                        message: 'Invalid reminder date' 
                    });
                }

                if (reminder.whatsappNumber && !/^\+?[1-9]\d{1,14}$/.test(reminder.whatsappNumber)) {
                    return res.status(400).json({ 
                        message: 'Invalid WhatsApp number format' 
                    });
                }
            }

            const notes = await db.getCollection('notes');
            const note = await notes.findOne({ 
                _id: new ObjectId(id),
                companyId: companyId.toString()
            });
            
            if (!note) {
                return res.status(404).json({ message: 'Note not found' });
            }

            // Update only provided fields
            const updateData = {
                ...(title && { title }),
                ...(content && { content }),
                ...(category && { category }),
                ...(priority && { priority }),
                ...(status && { status }),
                ...(reminder && { reminder }),
                companyId: companyId.toString(), // Ensure company ID doesn't change
                updatedAt: new Date()
            };

            await notes.updateOne(
                { _id: new ObjectId(id), companyId: companyId.toString() },
                { $set: updateData }
            );

            const updatedNote = await notes.findOne({ _id: new ObjectId(id) });

            // Reschedule reminder if updated
            if (reminder) {
                await scheduleReminder(updatedNote);
            }
            
            console.log(`Note ${id} updated successfully`);

            res.json(updatedNote);
        } catch (error) {
            console.error('Error updating note:', error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Delete a note
     */
    async deleteNote(req, res) {
        try {
            // Get company ID from authenticated user
            const companyId = req.user.companyId;
            
            if (!companyId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Company ID not found in user token'
                });
            }
            
            const { id } = req.params;
            console.log(`Deleting note ${id} for company ID: ${companyId}`);
            
            const notes = await db.getCollection('notes');
            
            // Verify note belongs to company before deleting
            const noteToDelete = await notes.findOne({
                _id: new ObjectId(id),
                companyId: companyId.toString()
            });
            
            if (!noteToDelete) {
                return res.status(404).json({ message: 'Note not found' });
            }
            
            const result = await notes.deleteOne({ 
                _id: new ObjectId(id),
                companyId: companyId.toString()
            });
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Note not found' });
            }
            
            console.log(`Note ${id} deleted successfully`);

            res.json({ message: 'Note deleted successfully' });
        } catch (error) {
            console.error('Error deleting note:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = noteController; 