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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Dashboard Welcome Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-glass-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Abishree HR Executive CMS</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
            Real-time management for talent pipelines, candidate dossiers, client inquiries, and enterprise practice frameworks.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/jobs"
            className="cursor-pointer flex-1 sm:flex-initial bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold text-xs px-5 py-3.5 rounded-xl shadow-md shrink-0 flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Post New Mandate</span>
          </Link>
          <Link
            href="/applications"
            className="cursor-pointer glass-card text-on-surface font-bold text-xs px-4 py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 hover:border-primary"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
            <span className="hidden sm:inline">Review Inbound</span>
          </Link>
        </div>
      </div>

      {/* High-Impact Operational Monitors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/jobs" className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-md border border-glass-border group hover:border-primary transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
              Active Mandates
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-glass-border group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">work</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-on-surface">Recruitment Pipeline</div>
            <div className="text-xs font-semibold text-primary mt-0.5">{jobs.length} Active Positions • Live Sourcing</div>
          </div>
        </Link>

        <Link href="/applications" className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-md border border-glass-border group hover:border-secondary transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-secondary/10 text-secondary border border-secondary/20">
              Talent Inbound
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-glass-border group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-on-surface">Candidate Dossiers</div>
            <div className="text-xs font-semibold text-secondary mt-0.5">{applications.length} Submissions • Resumes Ready</div>
          </div>
        </Link>

        <Link href="/inquiries" className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-md border border-glass-border group hover:border-tertiary transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-tertiary/10 text-tertiary border border-tertiary/20">
              Client SLA Queue
            </span>
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-glass-border group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">mark_email_unread</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-on-surface">Consultation Inquiries</div>
            <div className="text-xs font-semibold text-tertiary mt-0.5">
              {inquiries.filter(i => i.status === 'Unread').length > 0 
                ? `${inquiries.filter(i => i.status === 'Unread').length} Pending Review` 
                : 'All Inquiries Addressed'}
            </div>
          </div>
        </Link>

        <Link href="/services" className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-md border border-glass-border group hover:border-primary transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
              Practice Scope
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-glass-border group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">design_services</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-on-surface">HR Advisory Areas</div>
            <div className="text-xs font-semibold text-primary mt-0.5">{services.length} Core Practices Active</div>
          </div>
        </Link>
      </div>

      {/* Quick Launchpad */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-glass-border">
        <h3 className="text-sm font-extrabold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
          <span>Quick Administrative Launchpad</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/jobs" className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-[16px] text-primary">add</span>
            <span>New Job Post</span>
          </Link>
          <Link href="/applications" className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-[16px] text-secondary">visibility</span>
            <span>View Resumes</span>
          </Link>
          <Link href="/clients" className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-[16px] text-tertiary">handshake</span>
            <span>Manage Partners</span>
          </Link>
          <Link href="/users" className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-[16px] text-primary">admin_panel_settings</span>
            <span>Access Control</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
