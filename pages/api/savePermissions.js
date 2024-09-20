import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { permissions, empCode } = req.body; 
    const modifiedBy = req.body.modifiedBy; // Get modifiedBy from the body

    try {
      await Promise.all(permissions.map(async (permission) => {
        const { pageId, pageAccess, modifyAccess } = permission;

        if (pageAccess === 0) {
          await prisma.$executeRaw`
            DELETE FROM [sainithin].[dbo].[RolesByPage] 
            WHERE [Empcode] = ${empCode} AND [Page_Id] = ${pageId}`;
        } else {
          await prisma.$executeRaw`
            MERGE INTO [sainithin].[dbo].[RolesByPage] AS target
            USING (SELECT ${empCode} AS Empcode, ${pageId} AS Page_Id) AS source
            ON target.[Empcode] = source.Empcode AND target.[Page_Id] = source.Page_Id
            WHEN MATCHED THEN 
              UPDATE SET [Modify_Access] = ${modifyAccess}, [CreatedBy] = ${modifiedBy}, [CreatedDate] = GETDATE()
            WHEN NOT MATCHED THEN 
              INSERT ([Empcode], [Page_Id], [Modify_Access], [CreatedBy], [CreatedDate])
              VALUES (source.Empcode, source.Page_Id, ${modifyAccess}, ${modifiedBy}, GETDATE());
          `;
        }
      }));

      res.status(200).json({ message: 'Permissions saved successfully' });
    } catch (error) {
      console.error('Error saving permissions:', error);
      res.status(500).json({ message: 'Error saving permissions', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
