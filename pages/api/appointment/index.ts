import validateToken from '@/utils/validateToken';
import { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment-timezone';
import {prisma} from '@/utils/DBClient';
import logRequest from '@/utils/log';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { date } = req.query;


  switch (method) {
    case 'GET':
      await getAppointmentByDate(req, res, date)
      break;
    case 'POST':
      await addAppointment(req, res);
      break;
    // You can add more methods (GET, PUT, DELETE) later if necessary
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const addAppointment = async (req: NextApiRequest, res: NextApiResponse) => {
  const { patientId, patientDetails, vitals, departmentId, doctorId, isPaid } = req.body;
  
  const isValidToken: any = await validateToken(req, res);

  if(!isValidToken){
    return res.status(401).send({error: 'Not authenticated.'});
  }

  logRequest(req, res);

  if ((!patientId && !patientDetails) || !departmentId || !doctorId) {
    return res.status(400).json({ error: 'The necessary details are missing to add an appointment.' });
  }

  const date = new Date();

  let finalPatientId = patientId;

  try {

    // find last appointment of date
    const lastAppointment = await prisma.appointment.findFirst({
        orderBy: {
            date: 'desc',
        },
        where: {
            dateStr: moment(date).tz('Asia/Kolkata').format('DD/MM/YYYY'),
        },
    });

    // find last appointment number of patient if patient is already apointed
    const lastAppointmentOfPatient = patientId ? await prisma.appointment.findFirst({
        orderBy: {
            date: 'desc',
        },
        where: {
            patientId: patientId,
            departmentId: departmentId,
            doctorId: doctorId,
        },
    }) : null;


    const lastAppointmentDate = lastAppointmentOfPatient ? new Date(lastAppointmentOfPatient.date) : null;
    // date difference in days
    const dateDiff = lastAppointmentDate 
      ? moment(date)
        .tz('Asia/Kolkata')
        .endOf('day')
        .diff(
          moment(lastAppointmentDate)
          .tz('Asia/Kolkata')
          .endOf('day'), 
          'days'
        )
      : -1;

    // if last appointment is of today then isPaymentNeeded is false
    let isPaymentNeeded = true;
    if(lastAppointmentDate && dateDiff >= 0 && dateDiff < 7){
      isPaymentNeeded = false;
    }

    const lastAppointmentNo = lastAppointment ? lastAppointment.appointmentNo : 0;
            

    if (patientDetails && !patientId) {
      const newPatient = await prisma.patient.create({
        data: {
            name: patientDetails.name,
            age: patientDetails.age,
            gender: patientDetails.gender,
            tags: patientDetails.tags,
            address: patientDetails.address,
            createdAt: date,
            mobileNumber: patientDetails.mobNo,
        },
      });
      finalPatientId = newPatient.id;
    }

    const appointment = await prisma.appointment.create({
      data: {
        appointmentNo: lastAppointmentNo + 1,
        patientId: finalPatientId,
        departmentId: departmentId,
        doctorId: doctorId,
        date: date,
        isPaymentNeeded,
        isPaid: isPaid,
        dateStr: moment(date).tz('Asia/Kolkata').format('DD/MM/YYYY'),
        lastAppointmentId: lastAppointmentOfPatient?.id,
        createdById: isValidToken.id,
      },
    });

    if (vitals) {
      await prisma.vital.create({
        data: {
          isDiabetic: vitals.isDaibetic,
          isBP: vitals.isBP,
          isPregnant: vitals.isPregnant,
          isOtherDiseases: vitals.isOtherDisease,
          appointmentId: appointment.id,
        },
      });
    }

    return res.status(200).json(appointment);
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to add the appointment: ${error.message}` });
  }
};

const getAppointmentByDate = async (req: NextApiRequest, res: NextApiResponse, date: any) => {
  try {
    const isValidToken = await validateToken(req, res);

    if(!isValidToken){
      return res.status(401).send({error: 'Not authenticated.'});
    }

    if(typeof date !== 'string') {
      date = moment(new Date())
        .tz('Asia/Kolkata')
        .format('DD/MM/YYYY')
    }
    const appointments = await prisma.appointment.findMany({
      where: {
        dateStr: date,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
        vital: true,
        lastAppointment: true,
      },
      orderBy:{
        appointmentNo: 'desc',
      }
    });

    return res.status(200).json(appointments);
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to fetch the appointments: ${error.message}` });
  }
}