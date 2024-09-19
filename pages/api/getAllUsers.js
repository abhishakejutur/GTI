// pages/api/getUsernames.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const users = await prisma.$queryRaw`SELECT [EmployeeId] FROM [UserMaster]`;

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching usernames:', error);
    res.status(500).json({ error: 'Failed to fetch usernames' });
  } finally {
    await prisma.$disconnect();
  }
}
