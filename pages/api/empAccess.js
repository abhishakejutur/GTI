// pages/api/getAccessByEmpcode.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { empcode } = req.body;

    if (!empcode) {
      return res.status(400).json({ error: 'Employee code is required' });
    }

    try {
      const result = await prisma.$queryRaw`
        SELECT [Page_Id], [Modify_Access]
        FROM [sainithin].[dbo].[RolesByPage]
        WHERE [Empcode] = ${empcode}
      `;

      if (result.length === 0) {
        return res.status(404).json({ message: 'No access found for this employee code' });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
