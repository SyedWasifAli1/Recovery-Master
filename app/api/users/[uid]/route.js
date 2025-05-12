// app/api/users/[uid]/route.js
import { authAdmin } from '../../../lib/firebase-admin-config';
import { NextResponse } from 'next/server';

// CORS headers utility
const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

// OPTIONS method – CORS Preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

// GET - Fetch single user by UID
export async function GET(req, { params }) {
  try {
    const { uid } = params;
    const user = await authAdmin.getUser(uid);

    return NextResponse.json(
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
        metadata: user.metadata,
      },
      { status: 200, headers: getCorsHeaders() }
    );
  }catch (error) {
  return NextResponse.json(
    { error: error.message },
    { status: 500, headers: getCorsHeaders() }
  );
}
}

// PUT - Update user data
export async function PUT(req, { params }) {
  try {
    const { uid } = params;
    const { email, displayName, photoURL } = await req.json();

    const updateData = {};
    if (email) updateData.email = email;
    if (displayName) updateData.displayName = displayName;
    if (photoURL) updateData.photoURL = photoURL;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields provided to update' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    const updatedUser = await authAdmin.updateUser(uid, updateData);

    return NextResponse.json(
      {
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        photoURL: updatedUser.photoURL,
      },
      { status: 200, headers: getCorsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

// DELETE - Delete user by UID
export async function DELETE(req, { params }) {
  try {
    const { uid } = params;

    await authAdmin.deleteUser(uid);

    return NextResponse.json(
      { success: true, message: `User ${uid} deleted successfully` },
      { status: 200, headers: getCorsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}
