import { authAdmin } from '../../lib/firebase-admin-config';

export async function GET() {
  try {
    const listUsers = await authAdmin.listUsers(1000);
    const users = listUsers.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'No user Name',
      photoURL: user.photoURL || null,
    }));

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
