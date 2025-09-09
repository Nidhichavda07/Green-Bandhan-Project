import React, { useEffect, useState } from 'react';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // view-only page; creation is handled in admin

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://127.0.0.1:8000/api/blogs/');
        if (!res.ok) throw new Error('Failed to load blogs');
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.results || [];
        setBlogs(items);
      } catch (e) {
        setError(e.message || 'Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Blog</h1>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <p className="text-gray-600">No posts yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((b) => (
            <article key={b.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
              {b.image && (
                <img src={b.image} alt="" className="mb-4 w-full h-48 object-cover rounded" />
              )}
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{b.title}</h2>
              <div className="text-sm text-gray-500 mb-3">{b.category || 'General'} • {new Date(b.created_at).toLocaleDateString()}</div>
              <p className="text-gray-700 mb-3">{(b.content || '').slice(0, 220)}{(b.content || '').length > 220 ? '…' : ''}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;


