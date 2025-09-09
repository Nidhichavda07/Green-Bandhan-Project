import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';

const initialForm = { title: '', content: '', category: '', is_published: true };

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editImageFile, setEditImageFile] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/blogs/');
      if (!res.ok) throw new Error('Failed to load blogs');
      const data = await res.json();
      setBlogs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('category', form.category);
      formData.append('is_published', form.is_published);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('http://127.0.0.1:8000/api/blogs/', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create blog');
      }
      setForm(initialForm);
      setImageFile(null);
      fetchBlogs();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setEditForm({ title: b.title || '', content: b.content || '', category: b.category || '', is_published: !!b.is_published });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(initialForm);
    setEditImageFile(null);
  };

  const saveEdit = async (id) => {
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('content', editForm.content);
      formData.append('category', editForm.category);
      formData.append('is_published', editForm.is_published);
      if (editImageFile) formData.append('image', editImageFile);

      const res = await fetch(`http://127.0.0.1:8000/api/blogs/${id}/`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to update blog');
      }
      cancelEdit();
      fetchBlogs();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://127.0.0.1:8000/api/blogs/${id}/`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
      fetchBlogs();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Manage Blogs" onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Blogs</h2>
          <p className="text-gray-600">Create and manage blog posts for the landing page</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-green-700 mb-4">Add New Blog</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <input name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Environment, Sustainability..." />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Featured Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Content</label>
                <textarea name="content" value={form.content} onChange={handleChange} className="w-full border rounded px-3 py-2" rows="6" required />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
                Publish now
              </label>
              <button disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Blog'}
              </button>
            </form>
          </div>

          {/* List */}
          <div>
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Recent Posts</h3>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : blogs.length === 0 ? (
                <p className="text-gray-600">No posts yet.</p>
              ) : (
                <ul className="space-y-3">
                  {blogs.map((b) => (
                    <li key={b.id} className="border border-gray-200 rounded p-3">
                      {editingId === b.id ? (
                        <div className="space-y-2">
                          <input className="w-full border rounded px-3 py-2" value={editForm.title} onChange={(e)=>setEditForm((f)=>({...f, title: e.target.value}))} />
                          <input className="w-full border rounded px-3 py-2" value={editForm.category} onChange={(e)=>setEditForm((f)=>({...f, category: e.target.value}))} placeholder="Category" />
                          <textarea className="w-full border rounded px-3 py-2" rows="4" value={editForm.content} onChange={(e)=>setEditForm((f)=>({...f, content: e.target.value}))} />
                          <div>
                            <label className="text-sm text-gray-700">Replace Image (optional)</label>
                            <input type="file" accept="image/*" onChange={(e)=>setEditImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                          </div>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={editForm.is_published} onChange={(e)=>setEditForm((f)=>({...f, is_published: e.target.checked}))} />
                            Published
                          </label>
                          <div className="flex gap-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm" onClick={()=>saveEdit(b.id)} disabled={submitting}>Save</button>
                            <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm" onClick={cancelEdit}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="pr-3">
                            <div className="font-medium text-green-700">{b.title}</div>
                            <div className="text-xs text-gray-500">{b.category || 'General'} • {new Date(b.created_at).toLocaleDateString()}</div>
                            {b.image && (
                              <img src={b.image} alt="" className="mt-2 w-full max-h-40 object-cover rounded" />
                            )}
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{b.content}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${b.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {b.is_published ? 'Published' : 'Draft'}
                            </span>
                            <div className="flex gap-2">
                              <button className="text-xs bg-green-600 text-white px-2 py-1 rounded" onClick={()=>startEdit(b)}>Edit</button>
                              <button className="text-xs bg-red-600 text-white px-2 py-1 rounded" onClick={()=>deletePost(b.id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs;


