import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { emp_id } = req.body;

        if (!emp_id) {
            return res.status(400).json({ error: 'Employee ID is required' });
        }

        try {
            const user = await prisma.$queryRaw`
                SELECT * FROM UserMaster
                WHERE EmployeeId = ${emp_id}
            `;

            if (!user || user.length === 0) {
                return res.status(401).json({ error: 'Invalid Employee ID' });
            }

            const foundUser = user[0];

            await prisma.$executeRaw`
                UPDATE UserMaster
                SET LastLogin = CURRENT_TIMESTAMP, ModifiedDate = CURRENT_TIMESTAMP
                WHERE UserID = ${foundUser.UserID}
            `;

            res.status(200).json({ message: 'Login successful', redirect: '/foundary_weekly_plan' });

        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
