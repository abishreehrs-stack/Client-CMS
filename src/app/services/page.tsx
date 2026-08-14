'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';

export default function ServicesCMSPage() {
  const [services, setServices] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Executive Search');
  const [icon, setIcon] = useState('star');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState('');
  const [retentionRate, setRetentionRate] = useState('');
  const [deliverablesText, setDeliverablesText] = useState('');

  const fetchServices = () => {
    const token = localStorage.getItem('cms_token');
    fetch('${API_BASE}/api/services', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data);
        else setErrorMsg(data.error || 'Permission denied to manage services');
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Executive Search');
    setIcon('star');
    setTagline('');
    setDescription('');
    setTimeline('');
    setRetentionRate('');
    setDeliverablesText('');
    setShowModal(true);
  };

  const openEditModal = (srv: any) => {
    setEditingId(srv.id);
    setTitle(srv.title || '');
    setCategory(srv.category || 'Executive Search');
    setIcon(srv.icon || 'star');
    setTagline(srv.tagline || '');
    setDescription(srv.description || '');
    setTimeline(srv.timeline || '');
    setRetentionRate(srv.retentionRate || '');
    setDeliverablesText(
      Array.isArray(srv.deliverables) ? srv.deliverables.join(', ') : ''
    );
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service offering?')) return;
    const token = localStorage.getItem('cms_token');
    await fetch(`${API_BASE}/api/services/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchServices();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('cms_token');
    const deliverables = deliverablesText.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { title, category, icon, tagline, description, timeline, retentionRate, deliverables };

    const endpoint = editingId ? `${API_BASE}/api/services/${editingId}` : '${API_BASE}/api/services';
    const method = editingId ? 'PUT' : 'POST';

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
      alert(d.error || 'Failed to save service');
      return;
    }

    setShowModal(false);
    fetchServices();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Practice Offerings</span>
          <h1 className="text-2xl font-extrabold text-on-surface">Manage HR Services</h1>
          <p className="text-xs text-on-surface-variant">Add, edit, or remove HR consulting practice offerings (Requires `canManageServices`).</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="bg-primary hover:bg-primary-fixed-dim text-on-primary text-xs font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Service</span>
        </button>
      </div>

      {errorMsg ? (
        <div className="p-4 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      ) : services.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px] mb-2 text-primary">design_services</span>
          <p className="font-semibold text-sm">No HR services configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div key={srv.id} className="glass-card rounded-2xl p-6 flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-glass-border">
                    <span className="material-symbols-outlined text-[24px]">{srv.icon || 'star'}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">{srv.title}</h3>
                    <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">{srv.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => openEditModal(srv)}
                    className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-glass-border transition-all"
                    title="Edit Service"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(srv.id)}
                    className="p-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all"
                    title="Delete Service"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>

              {srv.tagline && <p className="text-[11px] text-primary font-semibold italic">{srv.tagline}</p>}
              <p className="text-xs text-on-surface-variant leading-relaxed">{srv.description}</p>
              
              <div className="flex items-center gap-4 text-[10px] text-on-surface-variant pt-1">
                {srv.timeline && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-primary">schedule</span>{srv.timeline}</span>}
                {srv.retentionRate && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-secondary">trending_up</span>{srv.retentionRate}</span>}
              </div>

              {srv.deliverables && Array.isArray(srv.deliverables) && srv.deliverables.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-glass-border">
                  {srv.deliverables.map((f: string, fIdx: number) => (
                    <span key={fIdx} className="text-[10px] bg-surface-container text-on-surface px-2.5 py-1 rounded-md border border-glass-border font-medium">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-surface border border-glass-border rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-primary p-1 rounded-full"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            <h2 className="text-xl font-extrabold text-on-surface mb-4">
              {editingId ? 'Edit Service Offering' : 'Add New Service Offering'}
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Executive Search & Leadership Hiring"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Executive Search">Executive Search</option>
                    <option value="Tech Staffing">Tech Staffing</option>
                    <option value="HR & Compliance">HR & Compliance</option>
                    <option value="HR Advisory">HR Advisory</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Icon (Material Symbol)</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. psychology, developer_mode"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Securing Visionary Leadership"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full description of this HR service offering..."
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Timeline</label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. 14-21 Business Days"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Retention Rate</label>
                  <input
                    type="text"
                    value={retentionRate}
                    onChange={(e) => setRetentionRate(e.target.value)}
                    placeholder="e.g. 96.2%"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Deliverables (comma-separated)</label>
                <input
                  type="text"
                  value={deliverablesText}
                  onChange={(e) => setDeliverablesText(e.target.value)}
                  placeholder="e.g. Competency Mapping, Leadership Interview, Offer Management"
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
