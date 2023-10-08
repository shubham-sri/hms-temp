import { NextApiRequest, NextApiResponse } from 'next';
import validateToken from '@/utils/validateToken';
import {prisma} from '@/utils/DBClient';
import logRequest from '@/utils/log';


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await getDoctors(req, res);
      break;
    case 'POST':
      await addDoctor(req, res);
      break;
    // You can add more methods (GET, PUT, DELETE) later if necessary
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const addDoctor = async (req: NextApiRequest, res: NextApiResponse) => {
    const isValidToken = await validateToken(req, res)

    if(!isValidToken){
        return res.status(401).send({error: 'Not authenticated.'});
    }

    logRequest(req, res);

    const { name, designation, department } = req.body;

    if (!name || !designation || !department) {
        return res.status(400).json({ error: 'Name, designation, and department ID are required to add a new doctor.' });
    }

    try {
        const departmentExists = await prisma.department.findUnique({
        where: {
            id: department,
        },
        });

        if (!departmentExists) {
        return res.status(400).json({ error: 'The provided department ID does not exist.' });
        }

        const doctor = await prisma.doctor.create({
        data: {
            name: name,
            designation: designation,
            departmentId: department,
        },
        });
        return res.status(200).json(doctor);
    } catch (error: any) {
        return res.status(500).json({ error: `Failed to add the doctor: ${error.message}` });
    }
};


const getDoctors = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const isValidToken = await validateToken(req, res)
  
      if(!isValidToken){
        return res.status(401).send({error: 'Not authenticated.'});
      }
      const departments = await prisma.doctor.findMany({
        include: {
            department: true,
        },
      });
      return res.status(200).json(departments);
    } catch (error: any) {
      return res.status(500).json({ error: `Failed to fetch departments: ${error.message}` });
    }
};