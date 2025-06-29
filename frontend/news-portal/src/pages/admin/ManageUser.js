import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get('/users', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            setUsers(res.data.data.data)
        })
        .catch(err => console.error(err));
    }, []);

    const handleDelete = (id) => {
        axios.delete(`/users/${id}`)
            .then(() => setUsers(users.filter(user => user.id !== id)));
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
            <table className="w-full table-auto bg-white shadow rounded">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-t">
                            <td className="px-4 py-2">{user.name}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">{user.role}</td>
                            <td className="px-4 py-2 space-x-2">
                                <button className="text-red-600" onClick={() => handleDelete(user.id)}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
