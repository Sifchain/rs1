import { getIronSession } from 'iron-session';

export const sessionOptions = {
  password: process.env.SESSION_SECRET, // Strong password stored in .env
  cookieName: 'my-session-cookie',
  cookieOptions: {
    secure: false,
  },
};

// Function to get the session
export async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}
