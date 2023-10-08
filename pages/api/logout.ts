import logRequest from '@/utils/log';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  logRequest(req, res);
  if (req.method !== 'POST') {
    return res.status(405).end();  // Method not allowed if not POST
  }

  // Set JWT token as HttpOnly cookie
  res.setHeader('Set-Cookie', [
    `token=; HttpOnly; Path=/; Max-Age=${0}`, // 18 hour in seconds
    // If you're in production and have SSL set up, you should add the Secure attribute
    // `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60}; Secure`,
  ]);

  return res.status(200).json({ message: 'Logged out successfully' });
}
