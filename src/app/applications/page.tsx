'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewApp, setPreviewApp] = useState<any | null>(null);

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
    if (previewApp?.id === id) setPreviewApp(null);
    fetchApps();
  };

  const handleDownloadResume = (app: any) => {
    if (app.resumeData && app.resumeData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = app.resumeData;
      link.download = app.resumeName || app.resumeFileName || `${app.name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Generate a printable Executive Candidate Dossier
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Abishree HR - Candidate Dossier - ${app.name}</title>
            <meta charset="utf-8" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #18231c; line-height: 1.6; max-width: 800px; margin: 0 auto; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #12634a; padding-bottom: 16px; margin-bottom: 28px; }
              .brand { font-size: 24px; font-weight: 900; color: #12634a; }
              .subbrand { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #718175; font-weight: 700; }
              .badge { background: #BBF1D2; color: #002116; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; }
              .card { background: #f5f9f4; border: 1px solid #c0cfc4; padding: 20px; border-radius: 14px; margin-bottom: 24px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
              .label { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #718175; margin-bottom: 3px; letter-spacing: 0.5px; }
              .val { font-size: 15px; font-weight: 700; color: #18231c; }
              .footer { margin-top: 40px; font-size: 11px; color: #718175; text-align: center; border-top: 1px solid #e1ede3; padding-top: 16px; }
              @media print { .no-print { display: none !important; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="brand">Abishree HR Consultants</div>
                <div class="subbrand">Executive Search & Manpower Advisory</div>
              </div>
              <div style="text-align: right;">
                <span class="badge">${app.status || 'Pending Review'}</span>
              </div>
            </div>

            <div class="card">
              <h1 style="margin: 0 0 6px 0; font-size: 22px; color: #12634a;">${app.name}</h1>
              <div style="font-size: 15px; font-weight: 800; color: #9c4b26;">Applied Role: ${app.jobTitle}</div>
            </div>

            <div class="grid">
              <div>
                <div class="label">Email Address</div>
                <div class="val">${app.email}</div>
              </div>
              <div>
                <div class="label">Phone Contact</div>
                <div class="val">${app.phone || '—'}</div>
              </div>
              <div>
                <div class="label">Total Professional Experience</div>
                <div class="val">${app.experience ? `${app.experience} Years` : 'Not Specified'}</div>
              </div>
              <div>
                <div class="label">Current Employer</div>
                <div class="val">${app.currentCompany || 'Not Disclosed'}</div>
              </div>
              <div>
                <div class="label">Attached Resume Reference</div>
                <div class="val">${app.resumeName || app.resumeFileName || 'Uploaded Resume.pdf'}</div>
              </div>
              <div>
                <div class="label">Application Timestamp</div>
                <div class="val">${app.date ? new Date(app.date).toLocaleString('en-IN') : 'Recent'}</div>
              </div>
            </div>

            ${app.notes ? `
              <div style="margin-top: 24px;">
                <div class="label">Candidate Cover Notes / Summary</div>
                <div class="card" style="margin-top: 6px; font-size: 14px; white-space: pre-wrap;">${app.notes}</div>
              </div>
            ` : ''}

            <div class="footer">
              Confidential Candidate Dossier • Abishree HR Management Portal • Verified Application
            </div>

            <div class="no-print" style="text-align: center; margin-top: 30px;">
              <button onclick="window.print()" style="background: #12634a; color: white; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(18,99,74,0.2);">
                Print / Save as PDF
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Talent Inbound</span>
          <h1 className="text-2xl font-extrabold text-on-surface">Candidate Job Applications</h1>
          <p className="text-xs text-on-surface-variant">Review candidate details, resume attachments, and update hiring stage (Requires `canViewApplications`).</p>
        </div>
        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          <span className="glass-card px-3 py-2 rounded-xl font-bold text-primary border border-glass-border">
            {applications.length} Total Applicants
          </span>
        </div>
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
                  className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-md border border-glass-border"
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
                      {app.experience ? `${app.experience} Yrs Exp` : 'Exp N/A'}
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

                  {/* Resume Attachment Box */}
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">picture_as_pdf</span>
                      <div className="min-w-0">
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold block leading-tight">Attached Resume</span>
                        <span className="text-xs font-bold text-on-surface truncate block">
                          {app.resumeName || app.resumeFileName || 'Candidate_Resume.pdf'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setPreviewApp(app)}
                        className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-glass-border text-xs font-bold flex items-center gap-1"
                        title="View Resume"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDownloadResume(app)}
                        className="cursor-pointer p-1.5 rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary shadow-sm flex items-center justify-center"
                        title="Download PDF"
                      >
                        <span className="material-symbols-outlined text-[15px]">download</span>
                      </button>
                    </div>
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
                  <th className="p-4">Resume / Attachment</th>
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
                    <td className="p-4 text-on-surface-variant font-semibold">
                      {app.experience ? `${app.experience} Yrs` : '—'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewApp(app)}
                          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all"
                          title="Preview Resume Dossier"
                        >
                          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                          <span className="truncate max-w-[130px]">{app.resumeName || app.resumeFileName || 'Resume.pdf'}</span>
                        </button>
                        <button
                          onClick={() => handleDownloadResume(app)}
                          className="cursor-pointer p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-glass-border"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-[15px]">download</span>
                        </button>
                      </div>
                    </td>
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
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setPreviewApp(app)} 
                          className="cursor-pointer p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-glass-border transition-all"
                          title="View Full Profile"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(app.id)} 
                          className="cursor-pointer p-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all"
                          title="Delete Entry"
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
        </>
      )}

      {/* ---------------- RESUME & CANDIDATE DOSSIER PREVIEW MODAL ---------------- */}
      {previewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-glass-border rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-glass-border">
                  <span className="material-symbols-outlined text-[22px]">badge</span>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-on-surface">{previewApp.name}</h2>
                  <span className="text-xs font-bold text-primary">{previewApp.jobTitle}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewApp(null)}
                className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 overflow-y-auto flex flex-col gap-4">
              
              {/* Candidate Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-surface-container text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Experience</span>
                  <span className="text-xs font-extrabold text-on-surface mt-0.5 block">
                    {previewApp.experience ? `${previewApp.experience} Years` : 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Current Company</span>
                  <span className="text-xs font-extrabold text-on-surface mt-0.5 block truncate">
                    {previewApp.currentCompany || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Hiring Status</span>
                  <span className="text-xs font-extrabold text-secondary mt-0.5 block">
                    {previewApp.status || 'Pending Review'}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-xl bg-surface-container/60 text-xs">
                <a 
                  href={`mailto:${previewApp.email}`} 
                  className="flex items-center gap-2 text-primary font-bold hover:underline flex-1"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span>{previewApp.email}</span>
                </a>
                {previewApp.phone && (
                  <a 
                    href={`tel:${previewApp.phone}`} 
                    className="flex items-center gap-2 text-on-surface font-bold flex-1"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">phone</span>
                    <span>{previewApp.phone}</span>
                  </a>
                )}
              </div>

              {/* Candidate Cover Note */}
              {previewApp.notes && (
                <div className="p-3.5 rounded-xl bg-surface-container/40 border border-glass-border text-xs text-on-surface-variant leading-relaxed">
                  <span className="text-[10px] text-on-surface font-bold uppercase tracking-wider block mb-1">Candidate Cover Notes</span>
                  <p className="whitespace-pre-wrap">{previewApp.notes}</p>
                </div>
              )}

              {/* Resume Attachment Viewer / Download Box */}
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                    <div>
                      <span className="text-xs font-extrabold text-on-surface block">
                        {previewApp.resumeName || previewApp.resumeFileName || 'Candidate_Resume.pdf'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        {previewApp.resumeData ? 'Uploaded PDF Document (Ready)' : 'Verified Application Dossier'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadResume(previewApp)}
                    className="cursor-pointer px-4 py-2 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download PDF</span>
                  </button>
                </div>

                {/* Embedded PDF iframe if Base64 Data URL exists */}
                {previewApp.resumeData && previewApp.resumeData.startsWith('data:') && (
                  <iframe 
                    src={previewApp.resumeData} 
                    className="w-full h-64 rounded-xl border border-glass-border bg-surface"
                    title="Resume Document Preview"
                  />
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-glass-border flex items-center justify-between">
              <span className="text-[10px] text-on-surface-variant font-medium">
                Submitted on {previewApp.date ? new Date(previewApp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
              </span>
              <button
                onClick={() => setPreviewApp(null)}
                className="cursor-pointer px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
