import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { emp_id } = req.body;

    try {
      const result = await prisma.$queryRaw`
        SELECT Page_Id FROM RolesByPage WHERE Empcode = ${emp_id}
      `;

      if (result.length > 0) {
        const pages = result.map(row => row.Page_Id).join(', ');
        return res.status(200).json({ emp_id, pages });
      } else {
        return res.status(404).json({ error: 'Employee code not found' });
      }
    } catch (error) {
      console.error('Error querying database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
