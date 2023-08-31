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
        const { data } = req.body
        const jsonData = JSON.parse(data);

        const { filename, path } = req.file;


        // Check if the user exists
        const plaignant = await prisma.plaignant.findUnique({ where: { id: jsonData.userId } });
        if (!plaignant) {
            return res.status(401).json({ error: 'Plaignant not found' });
        }

        const newComplaint = await prisma.complaint.create({
            data: {
                content: jsonData.content,
                type: jsonData.type,
                objet: jsonData.objet,
                plaignantId: jsonData.userId,
            },
        });

        const uploadImage = await prisma.file.create({
            data: {
                path: filename,
                complaintId: newComplaint.id
            }
        })

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

// get a user complaints
async function getUserComplaints(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const plaignant = await prisma.plaignant.findUnique({
            where: { id: userId },
            include: {
                complaints: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        answer: true // Include the associated answer
                    }
                }
            },
        });
        if (!plaignant) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        res.json(plaignant.complaints);
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// get filtred complaintes
async function getComplaintsFilter(req, res) {
    const { type } = req.body;

    try {
        const complaints = await prisma.complaint.findMany({
            where: {
                type: type // Filter by the complaint type
            }
            // You can include other options like orderBy and select as needed
        });

        res.json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'An error occurred while fetching complaints' });
    }
}

// update a complaint
async function updateComplaint(req, res) {
    try {
        const complaintId = parseInt(req.params.id);
        const { content, type, objet } = req.body;

        const updatedComplaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                content,
                type,
                objet,
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

module.exports = { getComplaints, createComplaint, getComplaintById, updateComplaint, deleteComplaint, getUserComplaints, getComplaintsFilter };
