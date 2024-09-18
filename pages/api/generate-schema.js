// pages/api/generate-client.js
import { execSync } from 'child_process';

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const result = execSync('npx prisma generate --schema=./prisma/schema1.prisma', {
        encoding: 'utf-8',
      });

      console.log('Prisma Client generated successfully:', result);
      res.status(200).json({ message: 'Prisma Client generated successfully' });
    } catch (error) {
      console.error('Error generating Prisma Client:', error);
      res.status(500).json({ error: 'Failed to generate Prisma Client' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
