// pages/api/checkPageAccess.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { page_id, emp_id } = req.body;

    if (!page_id || !emp_id) {
      return res.status(400).json({ error: 'Page ID and Employee ID are required' });
    }

    try {
      const result = await prisma.$queryRaw`
        SELECT [Modify_Access]
        FROM [sainithin].[dbo].[RolesByPage]
        WHERE [Empcode] = ${emp_id} AND [Page_Id] = ${page_id}
      `;

        if (result.length > 0) {
            return res.status(200).json({ exists: true, Modify_Access: result[0].Modify_Access });
        }  else {
        return res.status(404).json({ exists: false, message: 'No access found for this page ID' });
      }
    } catch (error) {
      console.error('Error checking page access:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
