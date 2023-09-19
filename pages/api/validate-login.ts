import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function validate(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  // Extract the token from the cookie
  const token = req.cookies.token;

  // If there's no token in the cookie, return a 401 status
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    // Verify the token with the secret key
    const decoded = jwt.verify(token, JWT_SECRET as string);
    
    // Optionally, you can return user information from the decoded JWT payload
    // For this example, let's just return a success message.
    return res.status(200).json({ message: 'Authenticated.', authenticated: true });

  } catch (error) {
    // If the token is expired or has any other error, return a 401 status
    return res.status(401).json({ error: 'Not authenticated.' });
  }
}
