import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/utils/DBClient';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: {patientId : id},
    method,
  } = req;

  switch (method) {
    case 'GET':
      await getPatient(req, res, parseInt(id as string));
      break;
    // You can add more methods (PUT, DELETE) later if necessary
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const getPatient = async (req: NextApiRequest, res: NextApiResponse, id: number) => {
  if (!id) {
    return res.status(400).json({ error: 'Patient ID is required.' });
  }

  try {
    const patient = await prisma.patient.findUnique({where: { id: id }});

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    return res.status(200).json(patient);
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to fetch the appointment: ${error.message}` });
  }
};
