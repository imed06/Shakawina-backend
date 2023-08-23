const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// get all complaints controller
async function getComplaints(req, res) {
    try {
        const complaints = await prisma.complaint.findMany();
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// create a new complaint
async function createComplaint(req, res) {
    try {
        const { title, content, userId, complaintType, subject } = req.body;

        // Check if the user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const newComplaint = await prisma.complaint.create({
            data: {
                title,
                content,
                userId,
                complaintType,
                subject,
            },
        });
        res.status(201).json({ message: 'Complaint created successfully', complaint: newComplaint });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// get a single complaint
async function getComplaintById(req, res) {
    try {
        const complaintId = parseInt(req.params.id);
        const complaint = await prisma.complaint.findUnique({
            where: { id: complaintId },
        });
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        res.json(complaint);
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// update a complaint
async function updateComplaint(req, res) {
    try {
        const complaintId = parseInt(req.params.id);
        const { title, content, complaintType, subject } = req.body;

        const updatedComplaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                title,
                content,
                complaintType,
                subject,
            },
        });

        res.json({ message: 'Complaint updated successfully', complaint: updatedComplaint });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// delete a complaint
async function deleteComplaint(req, res) {
    try {
        const complaintId = parseInt(req.params.id);
        await prisma.complaint.delete({
            where: { id: complaintId },
        });
        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { getComplaints, createComplaint, getComplaintById, updateComplaint, deleteComplaint };
