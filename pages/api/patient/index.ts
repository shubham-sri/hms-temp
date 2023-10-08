import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/utils/DBClient';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: {phoneNumber},
    method,
  } = req;

  switch (method) {
    case 'GET':
      await getPatient(req, res, phoneNumber as string);
      break;
    // You can add more methods (PUT, DELETE) later if necessary
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const getPatient = async (req: NextApiRequest, res: NextApiResponse, phoneNumber: string) => {
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Patient phone number is required.' });
  }

  // if(phoneNumber === '1234567890' || phoneNumber === '0987654321' || phoneNumber === '0000000000') {
  //   return res.status(200).json([]);
  // }

  try {
    const patient = await prisma.patient.findMany({where: { mobileNumber: {
        equals: phoneNumber,
    }}});

    if (!patient || patient.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(patient);
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to fetch the appointment: ${error.message}` });
  }
};
