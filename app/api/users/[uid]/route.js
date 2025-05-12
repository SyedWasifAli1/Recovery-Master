// app/api/users/[uid]/route.js
import { authAdmin } from '../../../lib/firebase-admin-config';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    const { uid } = params;

    await authAdmin.deleteUser(uid);
    return NextResponse.json({ success: true, message: `User ${uid} deleted.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
