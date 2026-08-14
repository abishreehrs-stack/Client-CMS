'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';

export default function InquiriesCMSPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInquiries = () => {
    const token = localStorage.getItem('cms_token');
    fetch(`${API_BASE}/api/inquiries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInquiries(data);
        else setErrorMsg(data.error || 'Permission denied to view inquiries');
      });
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('cms_token');
    await fetch(`${API_BASE}/api/inquiries/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchInquiries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    const token = localStorage.getItem('cms_token');
    await fetch(`${API_BASE}/api/inquiries/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchInquiries();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Unread': return 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20';
      case 'Read': return 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20';
      case 'Responded': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20';
      case 'Closed': return 'bg-surface-container text-on-surface-variant border-glass-border';
      default: return 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Inbound Leads</span>
          <h1 className="text-2xl font-extrabold text-on-surface">Client Inquiries Inbox</h1>
          <p className="text-xs text-on-surface-variant">Review, track, and manage consultation requests (Requires `canViewInquiries`).</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="glass-card px-3 py-2 rounded-xl font-bold text-primary border border-glass-border">
            {inquiries.filter(i => i.status === 'Unread').length} Unread
          </span>
          <span className="glass-card px-3 py-2 rounded-xl font-bold text-on-surface-variant border border-glass-border">
            {inquiries.length} Total
          </span>
        </div>
      </div>

      {errorMsg ? (
        <div className="p-4 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px] mb-2 text-primary">inbox</span>
          <p className="font-semibold text-sm">No client inquiries at this time.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-glass-border">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container text-on-surface-variant font-bold border-b border-glass-border uppercase tracking-wider">
              <tr>
                <th className="p-4">Client Contact</th>
                <th className="p-4">Service of Interest</th>
                <th className="p-4">Inquiry Details</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm text-on-surface">{inq.name}</div>
                    <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">{inq.email}</div>
                    {inq.phone && <div className="text-[11px] text-on-surface-variant font-medium">{inq.phone}</div>}
                  </td>
                  <td className="p-4 font-bold text-primary max-w-[180px] truncate">{inq.serviceInterest || 'General Inquiry'}</td>
                  <td className="p-4 text-on-surface-variant leading-relaxed max-w-md">
                    <div className="line-clamp-2">{inq.message}</div>
                  </td>
                  <td className="p-4 text-on-surface-variant text-[11px] font-medium whitespace-nowrap">
                    {inq.date ? new Date(inq.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="p-4">
                    <select
                      value={inq.status || 'Unread'}
                      onChange={(e) => updateStatus(inq.id, e.target.value)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border focus:outline-none ${getStatusColor(inq.status || 'Unread')}`}
                    >
                      <option value="Unread">Unread</option>
                      <option value="Read">Read</option>
                      <option value="Responded">Responded</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(inq.id)} 
                      className="p-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all"
                      title="Delete Inquiry"
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
