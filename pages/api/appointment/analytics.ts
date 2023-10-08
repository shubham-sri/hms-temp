// pages/api/analyticalData.ts

import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/utils/DBClient';
import moment from 'moment-timezone';
import logRequest from '@/utils/log';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    logRequest(req, res);
    if (req.method !== 'GET') {
        return res.status(405).end(); // Method not allowed if not GET
    }

    const { date } = req.query;

    if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'Date is required as a query parameter.' });
    }

    try {
        // 1. Total paid users vs not paid users grouped doctor-wise
        const doctorWisePayments = await prisma.appointment.groupBy({
            by: ['doctorId', 'isPaid'],
            where: {
                dateStr: date,
            },
            _count: true,
        });

        const doctorIds = doctorWisePayments.map(data => data.doctorId);

        const doctors = await prisma.doctor.findMany({
            where: {
                id: {
                    in: doctorIds,
                }
            }
        });

        const doctorWisePaymentsWithDetails = doctorWisePayments.map(data => ({
            ...data,
            doctor: doctors.find(doctor => doctor.id === data.doctorId),
        }));


        // 2.

        const startDate = moment(date, 'DD/MM/YYYY').startOf('month');
        const endDate = startDate.clone().endOf('month');

        const departmentTrafficData = await prisma.appointment.groupBy({
            by: ['departmentId', 'date'],
            where: {
                date: {
                    gte: startDate.toDate(),
                    lte: endDate.toDate(),
                },
            },
            _count: true,
        });

        const departmentIds = departmentTrafficData.map(data => data.departmentId);
        const departments = await prisma.department.findMany({
            where: {
                id: {
                    in: departmentIds,
                }
            }
        });

        const departmentTrafficWithDetails = departmentTrafficData.map(data => ({
            date: data.date,
            department: departments.find(department => department.id === data.departmentId),
            count: data._count,
        }));


        

        return res.status(200).json({ doctorWisePayments: doctorWisePaymentsWithDetails, departmentTrafficWithDetails });
    } catch (error: any) {
        return res.status(500).json({ error: `Failed to fetch the analytical data: ${error.message}` });
    }
}
