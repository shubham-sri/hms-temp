import { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment-timezone';
import {prisma} from '@/utils/DBClient';
import validateToken from '@/utils/validateToken';
import logRequest from '@/utils/log';

interface EditBody {
    appointmentId?: number,
    patientId?: number,
    patientDetails: {
      name: string;
      age: number;
      gender: 'M'|'F';
      tags: string[];
      address: string;
      mobNo: string;
    },
    vitals: {
      vitalId?: number;
      isDaibetic: boolean;
      isBP: boolean;
      isPregnant: boolean;
      isOtherDisease: boolean;
    },
    departmentId: number,
    doctorId: number,
    isPaid: boolean,
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      await editAppointment(req, res);
      break;
    // You can add more methods (GET, PUT, DELETE) later if necessary
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const editAppointment = async (req: NextApiRequest, res: NextApiResponse) => {

  const isValidToken = await validateToken(req, res)

  if(!isValidToken){
    return res.status(401).send({error: 'Not authenticated.'});
  }

  logRequest(req, res);

  const { patientId, patientDetails, vitals, departmentId, doctorId, isPaid, appointmentId } = req.body as EditBody;

  if ((!patientId && !patientDetails) || !departmentId || !doctorId) {
    return res.status(400).json({ error: 'The necessary details are missing to add an appointment.' });
  }

  const date = new Date();

  let finalPatientId = patientId;

  try {
    if (patientDetails && patientId) {
        const patient = await prisma.patient.findUnique({
            where: {
                id: patientId,
            }
        });
        const newPatient = await prisma.patient.update({
            data: {
                name: patientDetails.name,
                age: patientDetails.age,
                gender: patientDetails.gender,
                tags: patientDetails.tags as any,
                address: patientDetails.address,
                createdAt: patient?.age != patientDetails.age 
                    ? date 
                    : patient.createdAt,
                mobileNumber: patientDetails.mobNo,
            },
            where: {
                id: patientId,
            }
        });
        finalPatientId = newPatient.id;
    }

    const appointment = await prisma.appointment.update({
      data: {
        patientId: finalPatientId,
        departmentId: departmentId,
        doctorId: doctorId,
        isPaid: isPaid,
      },
        where: {
            id: appointmentId,
        },
    });

    if (vitals) {
      await prisma.vital.update({
        data: {
          isDiabetic: vitals.isDaibetic,
          isBP: vitals.isBP,
          isPregnant: vitals.isPregnant,
          isOtherDiseases: vitals.isOtherDisease,
        },
        where: {
            id: vitals.vitalId,
        },
      });
    }

    return res.status(200).json(appointment);
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to add the appointment: ${error.message}` });
  }
};