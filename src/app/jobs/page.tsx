'use client';

import React, { useEffect, useState } from 'react';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Executive Recruitment');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-Time');
  const [experience, setExperience] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');

  const fetchJobs = () => {
    const token = localStorage.getItem('cms_token');
    fetch('http://localhost:5001/api/jobs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setJobs(data);
        else setErrorMsg(data.error || 'Permission denied to manage jobs');
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJobId(null);
    setTitle('');
    setLocation('');
    setExperience('');
    setSalary('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (job: any) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setType(job.type);
    setExperience(job.experience || '');
    setSalary(job.salary || '');
    setDescription(job.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job vacancy?')) return;
    const token = localStorage.getItem('cms_token');
    await fetch(`http://localhost:5001/api/jobs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchJobs();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('cms_token');
    const payload = { title, department, location, type, experience, salary, description };

    const endpoint = editingJobId ? `http://localhost:5001/api/jobs/${editingJobId}` : 'http://localhost:5001/api/jobs';
    const method = editingJobId ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const d = await res.json();
      alert(d.error || 'Failed to save job');
      return;
    }

    setShowModal(false);
    fetchJobs();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Recruitment Mandates</span>
          <h1 className="text-2xl font-extrabold text-on-surface">Manage Job Postings</h1>
          <p className="text-xs text-on-surface-variant">Add, edit, or remove hot job vacancies (JWT + RBAC protected).</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="bg-primary hover:bg-primary-fixed-dim text-on-primary text-xs font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add New Job</span>
        </button>
      </div>

      {errorMsg ? (
        <div className="p-4 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-glass-border">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container text-on-surface-variant font-bold border-b border-glass-border uppercase tracking-wider">
              <tr>
                <th className="p-4">Title & Department</th>
                <th className="p-4">Location</th>
                <th className="p-4">Type / Exp</th>
                <th className="p-4">Salary</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm text-on-surface">{job.title}</div>
                    <div className="text-[11px] text-primary font-semibold mt-0.5">{job.department}</div>
                  </td>
                  <td className="p-4 text-on-surface-variant font-medium">{job.location}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-[10px] border border-glass-border">
                      {job.type}
                    </span>
                    {job.experience && <span className="ml-2 text-on-surface-variant text-[11px] font-medium">{job.experience}</span>}
                  </td>
                  <td className="p-4 font-bold text-secondary">{job.salary || 'Competitive'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(job)}
                        className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-glass-border transition-all"
                        title="Edit Job"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="p-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all"
                        title="Delete Job"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-surface border border-glass-border rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-primary p-1 rounded-full"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            <h2 className="text-xl font-extrabold text-on-surface mb-4">
              {editingJobId ? 'Edit Job Opening' : 'Post New Job Opening'}
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Talent Partner"
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Executive Recruitment">Executive Recruitment</option>
                    <option value="HR Advisory">HR Advisory</option>
                    <option value="Tech Recruitment">Tech Recruitment</option>
                    <option value="Leadership Advisory">Leadership Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Employment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai / Remote"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. ₹15L - ₹20L"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Experience Required</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 5-8 Years"
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Role Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key responsibilities and mandate scope..."
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-glass-border text-on-surface-variant text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary text-xs font-bold shadow-md"
                >
                  Save Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
