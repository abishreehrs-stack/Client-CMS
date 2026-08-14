'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';

export default function ClientsCMSPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [sector, setSector] = useState('Technology');
  const [logoText, setLogoText] = useState('');
  const [location, setLocation] = useState('');
  const [placements, setPlacements] = useState('');
  const [focus, setFocus] = useState('');
  const [relationship, setRelationship] = useState('');

  const fetchClients = () => {
    const token = localStorage.getItem('cms_token');
    fetch(`${API_BASE}/api/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClients(data);
        else setErrorMsg(data.error || 'Permission denied to manage clients');
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSector('Technology');
    setLogoText('');
    setLocation('');
    setPlacements('');
    setFocus('');
    setRelationship('');
    setShowModal(true);
  };

  const openEditModal = (c: any) => {
    setEditingId(c.id);
    setName(c.name || '');
    setSector(c.sector || 'Technology');
    setLogoText(c.logoText || '');
    setLocation(c.location || '');
    setPlacements(c.placements || '');
    setFocus(c.focus || '');
    setRelationship(c.relationship || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client partner?')) return;
    const token = localStorage.getItem('cms_token');
    await fetch(`${API_BASE}/api/clients/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchClients();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('cms_token');
    const payload = { name, sector, logoText, location, placements, focus, relationship };

    const endpoint = editingId ? `${API_BASE}/api/clients/${editingId}` : `${API_BASE}/api/clients`;
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
      alert(d.error || 'Failed to save client');
      return;
    }

    setShowModal(false);
    fetchClients();
  };

  const getClientInitials = (clientName: string, text?: string) => {
    if (text && text.length <= 4 && !text.includes(' ')) {
      return text.toUpperCase();
    }
    if (!clientName) return 'CL';
    const words = clientName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clientName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Corporate Ecosystem</span>
          <h1 className="text-2xl font-extrabold text-on-surface">Clients & Partners</h1>
          <p className="text-xs text-on-surface-variant">Add, edit, or remove client partner listings (Requires `canManageClients`).</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="bg-primary hover:bg-primary-fixed-dim text-on-primary text-xs font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Client Partner</span>
        </button>
      </div>

      {errorMsg ? (
        <div className="p-4 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      ) : clients.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px] mb-2 text-primary">handshake</span>
          <p className="font-semibold text-sm">No client partners added yet.</p>
        </div>
      ) : (
        <>
          {/* ---------------- MOBILE BLOCK VIEW (< md) ---------------- */}
          <div className="md:hidden flex flex-col gap-3.5">
            {clients.map((c) => (
              <div 
                key={c.id} 
                className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-md border border-glass-border"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 min-w-[40px] rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center font-extrabold text-primary text-xs shrink-0 shadow-sm uppercase tracking-wide">
                      {getClientInitials(c.name, c.logoText)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-on-surface truncate leading-snug">{c.name}</h3>
                      <span className="inline-block text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                        {c.sector}
                      </span>
                    </div>
                  </div>

                  {c.placements && (
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container text-secondary font-bold text-[10px] border border-glass-border shrink-0">
                      {c.placements}
                    </span>
                  )}
                </div>

                {/* Location & Focus Details */}
                <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-surface-container/60 text-xs">
                  {c.location && (
                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                      <span>{c.location}</span>
                    </div>
                  )}
                  {c.focus && (
                    <p className="text-[11px] text-on-surface font-medium pt-0.5 border-t border-glass-border/40">
                      {c.focus}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-glass-border">
                  <button 
                    onClick={() => openEditModal(c)}
                    className="cursor-pointer flex-1 py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-glass-border transition-all text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit Partner</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="cursor-pointer py-2 px-3 rounded-xl bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ---------------- DESKTOP TABLE VIEW (>= md) ---------------- */}
          <div className="hidden md:block glass-card rounded-2xl overflow-hidden shadow-lg border border-glass-border">
            <table className="w-full text-left text-xs text-on-surface">
              <thead className="bg-surface-container text-on-surface-variant font-bold border-b border-glass-border uppercase tracking-wider">
                <tr>
                  <th className="p-4">Client Name & Brand</th>
                  <th className="p-4">Sector</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Placements</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center font-extrabold text-primary text-xs shrink-0 shadow-sm uppercase tracking-wide">
                          {getClientInitials(c.name, c.logoText)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="font-bold text-sm text-on-surface truncate">{c.name}</div>
                          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant truncate mt-0.5">
                            {c.logoText && (
                              <span className="px-1.5 py-0.5 rounded bg-surface-container-high border border-glass-border text-[9px] font-black text-primary tracking-wider uppercase shrink-0">
                                {c.logoText}
                              </span>
                            )}
                            {c.focus && <span className="truncate max-w-[240px] opacity-75">{c.focus}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] border border-glass-border whitespace-nowrap">
                        {c.sector}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant font-medium text-xs">{c.location}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container text-secondary font-bold text-xs border border-glass-border whitespace-nowrap">
                        {c.placements || '—'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(c)}
                          className="cursor-pointer p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-glass-border transition-all"
                          title="Edit Client"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="cursor-pointer p-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all"
                          title="Delete Client"
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
              {editingId ? 'Edit Client Partner' : 'Add New Client Partner'}
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Horizon AI Labs"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Logo Text (3 Letters)</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                    placeholder="e.g. HAL"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Industry Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Logistics">Logistics</option>
                    <option value="BFSI">BFSI</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Placements Count</label>
                <input
                  type="text"
                  value={placements}
                  onChange={(e) => setPlacements(e.target.value)}
                  placeholder="e.g. 45+ Placements"
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Focus Area</label>
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g. AI Researchers, Cloud Architects & CPO Search"
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Relationship Type</label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Strategic Talent Partner Since 2021"
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
                  Save Client Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
