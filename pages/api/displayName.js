import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { emp_id } = req.body;

    try {
      const result = await prisma.$queryRaw`
        select Username from UserMaster where EmployeeId = ${emp_id}
      `;
      if (result.length > 0) {
        return res.status(200).json({ username: result[0].Username });
      } else {
        return res.status(404).json({ error: 'Username not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
