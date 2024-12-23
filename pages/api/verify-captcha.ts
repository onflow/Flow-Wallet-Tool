import type { NextApiRequest, NextApiResponse } from 'next';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.body;

  try {
    // Verify the token with Google's reCAPTCHA API
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      {
        method: 'POST',
      }
    );

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, errors: data['error-codes'] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify captcha' });
  }
} 