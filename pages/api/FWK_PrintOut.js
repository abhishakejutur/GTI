import { PrismaClient } from '@prisma/client';
import pdf from 'html-pdf';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { format } = req.query;

  try {
    const boms = await prisma.$queryRaw`
      SELECT TOP (1000) [Id], [Week_No], [Year_No], [Part_Number], [BOM_Id], 
                         [BOM_Code], [Bom_Version], [Quantity], [Monday], 
                         [Tuesday], [Wednesday], [Thursday], [Friday], 
                         [Saturday], [Sunday], [Created_By], [Created_Date]
      FROM [ProdcutionPlanning].[dbo].[Foundry_WeeklyPlan]
    `;

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Production Plan');

      worksheet.addRow([
        'Id', 'Week No', 'Year No', 'Part Number', 'BOM Id', 
        'BOM Code', 'BOM Version', 'Quantity', 'Monday', 
        'Tuesday', 'Wednesday', 'Thursday', 'Friday', 
        'Saturday', 'Sunday', 'Created By', 'Created Date'
      ]);

      boms.forEach(bom => {
        worksheet.addRow(Object.values(bom));
      });

      res.setHeader('Content-Disposition', 'attachment; filename=production_plan.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      const html = generateHTML(boms);
      const options = { format: 'A4', orientation: 'landscape' };

      pdf.create(html, options).toStream((err, stream) => {
        if (err) {
          return res.status(500).json({ error: 'Error generating PDF' });
        }
        res.setHeader('Content-Disposition', 'attachment; filename=production_plan.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        stream.pipe(res);
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

function generateHTML(data) {
  if (data.length === 0) {
    return `<h1>No Data Available</h1>`;
  }

  const rowsPerPage = 34;
  let pagesHtml = '';

  for (let startRow = 0; startRow < data.length; startRow += rowsPerPage) {
    const pageData = data.slice(startRow, startRow + rowsPerPage);
    
    if (pageData.length > 0) {
      const pageRows = pageData.map(bom => 
        `<tr>${Object.values(bom).map(value => `<td>${value}</td>`).join('')}</tr>`
      ).join('');

      const calculationsHtml = addCalculationsRow();

      pagesHtml += ` 
        <div class="page">
          <h1 style="font-size: 14px; text-align:center; margin: 5px;">Production Plan For Foundry WK 37 2024</h1>
          <p style="font-size: 10px; margin: 5px;">We are following 'IATF16949 CAPD method 10.3 continuous Improvement spirit' to improve our GTI</p>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Week No</th>
                <th>Year No</th>
                <th>Part Number</th>
                <th>BOM Id</th>
                <th>BOM Code</th>
                <th>BOM Version</th>
                <th>Quantity</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
                <th>Sunday</th>
                <th>Created By</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${pageRows}
              ${calculationsHtml}
            </tbody>
          </table><br />
          <footer>
            <div class="sign">
              <p>Prepared by</p>
              <p>Approved</p>
              <p>Countersigned</p>
            </div>
            <p class="footer-end" style="font-size: 10px; margin-top: 10px;">GreenTech Industries (India) Pvt. Ltd. @MIS 18.09.2024</p>
          </footer>
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Production Plan Print</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  box-sizing: border-box; 
                  padding: 15px;
                  padding-bottom:0px;
                  margin: 0; 
              }
              .page {
                  page-break-after: always; 
                  padding: 10px; 
                  box-sizing: border-box; 
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 10px;
              }
              th, td {
                  border: 1px solid #000;
                  padding: 2px; 
                  text-align: left;
                  font-size: 8px; 
              }
              th {
                  background-color: #f2f2f2;
              }
              .footer-end {
                  text-align: center;
                  margin-top: 10px;
              }
              .sign {
                  display: flex;
                  justify-content: space-between;
                  text-align: center;       
                  margin-top: 20px; 
              }
              .sign p {
                  display: inline-block;     
                  margin: 0 20px;           
                  font-size: 10px;          
              }
          </style>
      </head>
      <body>
          ${pagesHtml}
      </body>
      </html>`;
}

function addCalculationsRow() {
  const totalMoulds = Math.floor(Math.random() * 10000);
  const totalCasingWeight = Math.floor(Math.random() * 5000);
  const moltenMetalFC = Math.floor(Math.random() * 3000);
  const moltenMetalFCD = Math.floor(Math.random() * 2000);
  const totalMoltenMetal = totalCasingWeight + moltenMetalFC + moltenMetalFCD;

  return `
    <tr>
      <td colspan="8" style="text-align:right; border: 1px solid #000; padding: 2px;">Total Moulds</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoulds}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoulds}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoulds}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoulds}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoulds}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoulds}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoulds}</td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
    </tr>
    <tr>
      <td colspan="8" style="text-align:right; border: 1px solid #000; padding: 2px;">Total Casing Weight (kg)</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalCasingWeight}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalCasingWeight}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalCasingWeight}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalCasingWeight}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalCasingWeight}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalCasingWeight}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalCasingWeight}</td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
    </tr>
    <tr>
      <td colspan="8" style="text-align:right; border: 1px solid #000; padding: 2px;">Molten Metal FC</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFC}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFC}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFC}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFC}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFC}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFC}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFC}</td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
    </tr>
    <tr>
      <td colspan="8" style="text-align:right; border: 1px solid #000; padding: 2px;">Molten Metal FCD</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFCD}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFCD}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFCD}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFCD}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFCD}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFCD}</td>
      <td style="border: 1px solid #000; padding: 2px;">${moltenMetalFCD}</td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
    </tr>
    <tr>
      <td colspan="8" style="text-align:right; border: 1px solid #000; padding: 2px;">Total Molten Metal (kg)</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoltenMetal}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoltenMetal}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoltenMetal}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoltenMetal}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoltenMetal}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoltenMetal}</td>
      <td style="border: 1px solid #000; padding: 2px;">${totalMoltenMetal}</td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
      <td style="border: 1px solid #000; padding: 2px;"></td>
    </tr>
  `;
}
