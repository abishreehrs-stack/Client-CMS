'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CMSDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE}/api/jobs`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/applications`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/inquiries`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/services`, { headers }).then(r => r.json()).catch(() => [])
    ]).then(([j, a, i, s]) => {
      setJobs(Array.isArray(j) ? j : []);
      setApplications(Array.isArray(a) ? a : []);
      setInquiries(Array.isArray(i) ? i : []);
      setServices(Array.isArray(s) ? s : []);
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Dashboard Welcome Card */}
      <div className="glass-card p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div>
          <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Administrative Dashboard</span>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Abishree HR CMS Portal</h1>
          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">Real-time management for jobs, candidate applications, services, and security permissions.</p>
        </div>

        <Link
          href="/jobs"
          className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold text-xs px-6 py-3.5 rounded-xl shadow-md shrink-0 flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-3xl font-black text-primary">{jobs.length}</div>
            <div className="text-xs font-bold text-on-surface-variant mt-1">Active Job Vacancies</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-glass-border">
            <span className="material-symbols-outlined text-[26px]">work</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-3xl font-black text-secondary">{applications.length}</div>
            <div className="text-xs font-bold text-on-surface-variant mt-1">Applications Received</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-glass-border">
            <span className="material-symbols-outlined text-[26px]">badge</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-3xl font-black text-tertiary">{inquiries.filter(i => i.status === 'Unread').length}</div>
            <div className="text-xs font-bold text-on-surface-variant mt-1">Unread Inquiries</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-glass-border">
            <span className="material-symbols-outlined text-[26px]">mark_email_unread</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-3xl font-black text-primary">{services.length}</div>
            <div className="text-xs font-bold text-on-surface-variant mt-1">HR Practice Areas</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-glass-border">
            <span className="material-symbols-outlined text-[26px]">design_services</span>
          </div>
        </div>
      </div>
    </div>
  );
}
