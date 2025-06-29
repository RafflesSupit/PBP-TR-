import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    axios.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleCreate = () => {
    axios.post('/categories', { name })
      .then(res => {
        setCategories([...categories, res.data]);
        setName("");
      });
  };

  const handleDelete = (id) => {
    axios.delete(`/categories/${id}`)
      .then(() => setCategories(categories.filter(cat => cat.id !== id)));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
      <div className="flex mb-4 gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="border px-3 py-1 rounded"
          placeholder="New Category"
        />
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-1 rounded">
          Add
        </button>
      </div>

      <ul className="bg-white shadow rounded divide-y">
        {categories.map(cat => (
          <li key={cat.id} className="p-3 flex justify-between items-center">
            {cat.name}
            <button onClick={() => handleDelete(cat.id)} className="text-red-600">Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageCategories;
