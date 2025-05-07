'use client';

import { useEffect, useState } from 'react';

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:3000/api/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const deleteUser = async (uid) => {
    const res = await fetch(`http://localhost:3000/api/users/${uid}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(prev => prev.filter(user => user.uid !== uid));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="p-4">Loading users...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Firebase Users</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.uid} className="p-4 border rounded-md flex items-center justify-between">
            <div>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.displayName}</p>
            </div>
            <button
              onClick={() => deleteUser(user.uid)}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
