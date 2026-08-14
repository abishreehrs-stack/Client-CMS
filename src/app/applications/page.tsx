'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchApps = () => {
    const token = localStorage.getItem('cms_token');
    fetch(`${API_BASE}/api/applications`, {
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
        <>
          {/* ---------------- MOBILE BLOCK VIEW (< md) ---------------- */}
          <div className="md:hidden flex flex-col gap-3.5">
            {applications.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-xs text-on-surface-variant font-bold">
                No candidate applications received yet.
              </div>
            ) : (
              applications.map((app) => (
                <div 
                  key={app.id} 
                  className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-md border border-glass-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-on-surface leading-snug">{app.name}</h3>
                      <span className="inline-block text-xs text-primary font-bold mt-0.5">{app.jobTitle}</span>
                      {app.currentCompany && (
                        <span className="block text-[11px] text-on-surface-variant font-medium">@ {app.currentCompany}</span>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-bold text-[10px] border border-glass-border shrink-0">
                      {app.experience}
                    </span>
                  </div>

                  {/* Contact Info Pills */}
                  <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-surface-container/60 text-xs">
                    <a 
                      href={`mailto:${app.email}`} 
                      className="flex items-center gap-1.5 text-primary hover:underline font-semibold truncate"
                    >
                      <span className="material-symbols-outlined text-[14px]">mail</span>
                      <span className="truncate">{app.email}</span>
                    </a>
                    {app.phone && (
                      <a 
                        href={`tel:${app.phone}`} 
                        className="flex items-center gap-1.5 text-on-surface font-semibold"
                      >
                        <span className="material-symbols-outlined text-[14px] text-primary">phone</span>
                        <span>{app.phone}</span>
                      </a>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-glass-border">
                    <div className="flex-1">
                      <label className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">
                        Hiring Stage
                      </label>
                      <select
                        value={app.status || 'Pending Review'}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="w-full bg-surface-container border border-glass-border rounded-xl px-3 py-2 text-xs text-on-surface font-bold focus:outline-none focus:border-primary"
                      >
                        <option value="Pending Review">Pending Review</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => handleDelete(app.id)} 
                      className="cursor-pointer self-end p-2.5 rounded-xl bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all active:scale-95"
                      title="Delete Entry"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ---------------- DESKTOP TABLE VIEW (>= md) ---------------- */}
          <div className="hidden md:block glass-card rounded-2xl overflow-hidden shadow-lg border border-glass-border">
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
                        className="cursor-pointer p-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all"
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
        </>
      )}
    </div>
  );
}
