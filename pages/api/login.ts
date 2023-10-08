import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import {prisma} from '@/utils/DBClient';
import logRequest from '@/utils/log';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  logRequest(req, res);
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ error: 'User ID and Password are required.' });
  }

  const user = await prisma.user.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!user || user.password !== password) { // This is a basic comparison, consider using bcrypt in production.
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  // For real-world applications, you would probably generate a JWT or session here.
  // But for this example, we'll just return a success message.

  // Create a new token with the userId in the payload
  const token = jwt.sign({ userId: user.userId, id: user.id, }, JWT_SECRET as string, {
    expiresIn: '18h', // Set expiration as needed.
  });

  // Set JWT token as HttpOnly cookie
  res.setHeader('Set-Cookie', [
    `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 18}`, // 18 hour in seconds
    // If you're in production and have SSL set up, you should add the Secure attribute
    // `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60}; Secure`,
  ]);



  return res.status(200).json({ message: 'Logged in successfully.' });
}
