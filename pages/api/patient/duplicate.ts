import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/utils/DBClient';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
  } = req;

  switch (method) {
    case 'GET':
      await getPatient(req, res);
      break;
    // You can add more methods (PUT, DELETE) later if necessary
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const getPatient = async (req: NextApiRequest, res: NextApiResponse) => {

  try {
    const patients: any = await prisma.$queryRaw`
        select LOWER("name"), "mobileNumber", cast(count(*) as int) as count
        from patients 
        group by (LOWER("name"), "mobileNumber", "age") 
            having count (*) > 1 and "mobileNumber"!='1234567890'
    ;`;

    if (!patients || patients.length === 0) {
      return res.status(200).json([]);
    }

    const groups = [];
    for await (let patient of patients) {
        const {name, mobileNumber} = patient;
        const group = await prisma.patient.findMany({
            where: { 
                mobileNumber: {
                    equals: mobileNumber,
                },
                name: {
                    equals: name,
                },
            }
        });
        groups.push(group);
    }

    return res.status(200).json(groups);
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to fetch the appointment: ${error.message}` });
  }
};
