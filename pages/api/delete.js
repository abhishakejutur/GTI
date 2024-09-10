import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      console.error('ID missing:', id);
      return res.status(400).json({ error: 'ID is required' });
    }

    console.log('Received DELETE request with id:', id);

    try {
      const result = await prisma.foundry_WeeklyPlan.delete({
        where: { Id: Number(id) },
      });

      console.log('Delete successful:', result);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error deleting BOM:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    console.log('Method not allowed:', req.method);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
