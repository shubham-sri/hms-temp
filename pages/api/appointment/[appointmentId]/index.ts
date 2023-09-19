import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/utils/DBClient';
import validateToken from '@/utils/validateToken';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: {appointmentId : id},
    method,
  } = req;

  switch (method) {
    case 'GET':
      await getAppointment(req, res, parseInt(id as string));
      break;
    case 'PUT':
      break;
    // You can add more methods (PUT, DELETE) later if necessary
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const getAppointment = async (req: NextApiRequest, res: NextApiResponse, id: number) => {
  
  const isValidToken = await validateToken(req, res)

  if(!isValidToken){
    return res.status(401).send({error: 'Not authenticated.'});
  }
  
  if (!id) {
    return res.status(400).json({ error: 'Appointment ID is required.' });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: id },
      include: {
        patient: true,
        doctor: true,
        department: true,
        vital: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    return res.status(200).json(appointment);
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to fetch the appointment: ${error.message}` });
  }
};
