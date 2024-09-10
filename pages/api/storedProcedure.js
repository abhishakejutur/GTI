import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    try {
        const data = await prisma.$executeRaw`EXEC sp_WareStock`;
        res.status(200).json(data);
    } catch (error) {
        console.error("Error execution : ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
