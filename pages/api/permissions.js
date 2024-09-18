// pages/api/permissions.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { empId, pageId, pageAccess, modifyAccess } = req.body;
      if(!pageId && !pageAccess && !modifyAccess) {
        await prisma.$executeRaw`DELETE FROM RolesByPage WHERE Empcode = ${empId}`;
        await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId}`;
        return res.status(200).json({ message: 'Modify access and page access denied for all pages.' });
      }
      if(!pageAccess && modifyAccess) {
        await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId} AND Page_Id = ${pageId}`;
        return res.status(200).json({ message: 'Page access denied and Modify access Given for a page.' });
      }
      if( !pageId && !pageAccess && modifyAccess) {
        await prisma.$executeRaw`DELETE FROM RolesByPage WHERE Empcode = ${empId} `;
        await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId}`;
        return res.status(200).json({ message: 'Modify access given for all pages.' });
      }
      if (!pageAccess && !modifyAccess) {
        await prisma.$executeRaw`DELETE FROM RolesByPage WHERE Empcode = ${empId} AND Page_Id = ${pageId}`;
        await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId} AND Page_Id = ${pageId}`;
        return res.status(200).json({ message: 'Access denied and modify access denied for a page.' });
      }
      if(!pageId && pageAccess && !modifyAccess) {
        await prisma.$executeRaw`INSERT INTO RolesByPage (Empcode, Page_Id, Modify_Access) VALUES (${empId}, ${pageId}, ${modifyAccess})`;
        await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId}`;
        return res.status(200).json({ message: 'You got page access and a modify access denied for all pages.' });
      }
      if(!pageId && pageAccess && modifyAccess) {
        await prisma.$executeRaw`INSERT INTO RolesByPage (Empcode, Page_Id, Modify_Access) VALUES (${empId}, ${pageId}, ${modifyAccess})`;
        await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId}`;
        return res.status(200).json({ message: 'You got modify access and page access for all pages.' });
      }

      const existingEntry = await prisma.$queryRaw`SELECT * FROM RolesByPage WHERE Empcode = ${empId} AND Page_Id = ${pageId}`;

      if (existingEntry.length > 0) {
        await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId} AND Page_Id = ${pageId}`;
        return res.status(400).json({ message: 'Access already given. Modify Access updated' });
      }

      await prisma.$executeRaw`INSERT INTO RolesByPage (Empcode, Page_Id, Modify_Access) VALUES (${empId}, ${pageId}, ${modifyAccess})`;
      
      await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId} AND Page_Id = ${pageId}`;

      return res.status(201).json({ message: 'Access granted and modify access updated.' });
    } else if (req.method === 'PUT') {
      const { empId, pageId, modifyAccess } = req.body;

      await prisma.$executeRaw`UPDATE RolesByPage SET Modify_Access = ${modifyAccess} WHERE Empcode = ${empId} AND Page_Id = ${pageId}`;

      return res.status(200).json({ message: 'Modify access updated.' });
    } else {
      res.setHeader('Allow', ['POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
