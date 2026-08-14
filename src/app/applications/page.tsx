'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchApps = () => {
    const token = localStorage.getItem('cms_token');
    fetch('${API_BASE}/api/applications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setApplications(data);
        else setErrorMsg(data.error || 'Permission denied to view applications');
      });
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('cms_token');
    await fetch(`${API_BASE}/api/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchApps();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application entry?')) return;
    const token = localStorage.getItem('cms_token');
    await fetch(`${API_BASE}/api/applications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchApps();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Talent Inbound</span>
        <h1 className="text-2xl font-extrabold text-on-surface">Candidate Job Applications</h1>
        <p className="text-xs text-on-surface-variant">Review candidate details, experience, and update hiring stage (Requires `canViewApplications`).</p>
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
                <th className="p-4">Applicant & Contact</th>
                <th className="p-4">Applied Role</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Hiring Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm text-on-surface">{app.name}</div>
                    <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">{app.email} • {app.phone}</div>
                    {app.currentCompany && <div className="text-[10px] text-primary font-semibold mt-0.5">@ {app.currentCompany}</div>}
                  </td>
                  <td className="p-4 font-bold text-primary">{app.jobTitle}</td>
                  <td className="p-4 text-on-surface-variant font-semibold">{app.experience}</td>
                  <td className="p-4">
                    <select
                      value={app.status || 'Pending Review'}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="bg-surface-container border border-glass-border rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(app.id)} 
                      className="p-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all"
                      title="Delete Entry"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
