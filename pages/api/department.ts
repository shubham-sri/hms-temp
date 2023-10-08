import { NextApiRequest, NextApiResponse } from 'next';
import validateToken from '@/utils/validateToken';
import {prisma} from '@/utils/DBClient';
import logRequest from '@/utils/log';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await getDepartments(req, res);
      break;
    case 'POST':
      await addDepartment(req, res);
      break;
    // you can add more methods (GET, PUT, DELETE) as needed
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const addDepartment = async (req: NextApiRequest, res: NextApiResponse) => {

  const isValidToken = await validateToken(req, res)

  if(!isValidToken){
    return res.status(401).send({error: 'Not authenticated.'});
  }

  logRequest(req, res);

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required to add a new department.' });
  }

  try {
    const department = await prisma.department.create({
      data: {
        name: name,
      },
    });
    return res.status(200).json({department});
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to add the department: ${error.message}` });
  }
};

const getDepartments = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const isValidToken = await validateToken(req, res)

    if(!isValidToken){
      return res.status(401).send({error: 'Not authenticated.'});
    }
    const departments = await prisma.department.findMany();
    return res.status(200).json(departments);
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to fetch departments: ${error.message}` });
  }
};
