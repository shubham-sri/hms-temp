import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function validate(req: NextApiRequest, res: NextApiResponse) {
  // Extract the token from the cookie
  const token = req.cookies.token;

  console.log(token);

  // If there's no token in the cookie, return a 401 status
  if (!token) {
    return false;
  }

  try {
    // Verify the token with the secret key
    const decoded = jwt.verify(token, JWT_SECRET as string);
    return true;

  } catch (error) {
    // If the token is expired or has any other error, return a 401 status
    return false;
  }
}
