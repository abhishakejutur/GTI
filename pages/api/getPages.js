// pages/api/getPages.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const pages = await prisma.$queryRaw`
      SELECT [Page_Id], [PageName]
      FROM [sainithin].[dbo].[Page_Details]
    `;

    res.status(200).json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
