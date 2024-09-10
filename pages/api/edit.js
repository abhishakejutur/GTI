import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === 'POST') {
    const { id, data } = req.body;

    if (!id || !data) {
      console.error('ID or data missing:', { id, data });
      return res.status(400).json({ error: 'ID and update data are required' });
    }

    console.log('Received POST request with id:', id);
    console.log('Update data:', data);

    const updateData = {
      Week_No: Number(data.Week_No) || 0,
      Year_No: Number(data.Year_No) || 0,
      Part_Number: data.Part_Number || '',
      BOM_Id: Number(data.BOM_Id) || 0,
      BOM_Code: data.BOM_Code || '',
      Bom_Version: Number(data.Bom_Version) || 0,
      Quantity: Number(data.Quantity) || 0,
      Monday: Number(data.Monday) || 0,
      Tuesday: Number(data.Tuesday) || 0,
      Wednesday: Number(data.Wednesday) || 0,
      Thursday: Number(data.Thursday) || 0,
      Friday: Number(data.Friday) || 0,
      Saturday: Number(data.Saturday) || 0,
      Sunday: Number(data.Sunday) || 0
    };

    try {
      const result = await prisma.$queryRaw`
        UPDATE Foundry_WeeklyPlan
        SET 
          Week_No = ${updateData.Week_No},
          Year_No = ${updateData.Year_No},
          Part_Number = ${updateData.Part_Number},
          BOM_Id = ${updateData.BOM_Id},
          BOM_Code = ${updateData.BOM_Code},
          Bom_Version = ${updateData.Bom_Version},
          Quantity = ${updateData.Quantity},
          Monday = ${updateData.Monday},
          Tuesday = ${updateData.Tuesday},
          Wednesday = ${updateData.Wednesday},
          Thursday = ${updateData.Thursday},
          Friday = ${updateData.Friday},
          Saturday = ${updateData.Saturday},
          Sunday = ${updateData.Sunday}
        WHERE Id = ${Number(id)};
      `;

      console.log('Update successful:', result);
      return res.status(200).json({ message: 'Update successful' });
    } catch (error) {
      console.error('Error updating record:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    console.log('Method not allowed:', req.method);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
