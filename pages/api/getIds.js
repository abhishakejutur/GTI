import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const allEmployees = await prisma.$queryRaw`
        SELECT EmployeeId FROM dbo.UserMaster
      `;

      const employeePageAccess = await prisma.$queryRaw`
        SELECT 
          um.EmployeeId,
          rb.Page_Id
        FROM 
          dbo.UserMaster um
        LEFT JOIN 
          dbo.RolesByPage rb ON um.EmployeeId = rb.Empcode
        WHERE 
          rb.Page_Id IS NOT NULL
      `;

      const allPageDetails = await prisma.$queryRaw`
        SELECT Page_Id FROM dbo.Page_Details
      `;

      const pageIds = allPageDetails.map(page => page.Page_Id); 
      const employeeAccessMap = new Map();

      allEmployees.forEach(({ EmployeeId }) => {
        employeeAccessMap.set(EmployeeId, { EmployeeId, pagesAccess: [] });
      });

      employeePageAccess.forEach(({ EmployeeId, Page_Id }) => {
        if (employeeAccessMap.has(EmployeeId) && Page_Id) {
          const existingAccess = employeeAccessMap.get(EmployeeId);
          existingAccess.pagesAccess.push(Page_Id);
        }
      });

      const formattedEmployeeAccess = Array.from(employeeAccessMap.values()).map(emp => ({
        EmployeeId: emp.EmployeeId,
        pagesAccess: emp.pagesAccess.length > 0 ? emp.pagesAccess.join(', ') : null,
      }));

      res.status(200).json({
        employeeAccess: formattedEmployeeAccess, 
        pageIds: pageIds,
      });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
