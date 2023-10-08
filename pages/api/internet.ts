import validateToken from '@/utils/validateToken';
import { NextApiRequest, NextApiResponse } from 'next';
import logRequest from '@/utils/log';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query;
  if(!query) {
    return res.status(200).json({ message: 'ok' });
  }

  if(query.online === 'true') {
    await validateToken(req, res);
    logRequest(req, res);
  }
  return res.status(200).json({ message: 'ok' });
}
