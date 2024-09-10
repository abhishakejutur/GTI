import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const boms = await prisma.$queryRaw`
        SELECT TOP (1000) [Id]
          ,[Week_No]
          ,[Year_No]
          ,[Part_Number]
          ,[BOM_Id]
          ,[BOM_Code]
          ,[Bom_Version]
          ,[Quantity]
          ,[Monday]
          ,[Tuesday]
          ,[Wednesday]
          ,[Thursday]
          ,[Friday]
          ,[Saturday]
          ,[Sunday]
          ,[Created_By]
          ,[Created_Date]
        FROM [ProdcutionPlanning].[dbo].[Foundry_WeeklyPlan]
    `;
    res.status(200).json(boms);
  } catch (error) {
    console.error('Error fetching BOMs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
