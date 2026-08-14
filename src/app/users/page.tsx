'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DelegatedAdmin');

  // Permission Flags
  const [canManageJobs, setCanManageJobs] = useState(true);
  const [canViewApplications, setCanViewApplications] = useState(true);
  const [canManageServices, setCanManageServices] = useState(false);
  const [canManageClients, setCanManageClients] = useState(false);
  const [canViewInquiries, setCanViewInquiries] = useState(false);

  const fetchUsers = () => {
    const token = localStorage.getItem('cms_token');
    fetch(`${API_BASE}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
          setError('');
        } else {
          setError(data.error || 'Failed to fetch admin users');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('DelegatedAdmin');
    setCanManageJobs(true);
    setCanViewApplications(true);
    setCanManageServices(false);
    setCanManageClients(false);
    setCanViewInquiries(false);
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingId(user.id);
    setName(user.name || '');
    setEmail(user.email || '');
    setPassword('');
    setRole(user.role || 'DelegatedAdmin');
    setCanManageJobs(user.permissions?.canManageJobs ?? false);
    setCanViewApplications(user.permissions?.canViewApplications ?? false);
    setCanManageServices(user.permissions?.canManageServices ?? false);
    setCanManageClients(user.permissions?.canManageClients ?? false);
    setCanViewInquiries(user.permissions?.canViewInquiries ?? false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin account?')) return;
    const token = localStorage.getItem('cms_token');
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to delete user');
    }
    fetchUsers();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('cms_token');

    const permissions = {
      canManageJobs: role === 'SuperAdmin' || role === 'Admin' ? true : canManageJobs,
      canViewApplications: role === 'SuperAdmin' || role === 'Admin' ? true : canViewApplications,
      canManageServices: role === 'SuperAdmin' || role === 'Admin' ? true : canManageServices,
      canManageClients: role === 'SuperAdmin' || role === 'Admin' ? true : canManageClients,
      canViewInquiries: role === 'SuperAdmin' || role === 'Admin' ? true : canViewInquiries,
    };

    const payload: any = { name, email, role, permissions };
    if (password) payload.password = password;

    const endpoint = editingId ? `${API_BASE}/api/users/${editingId}` : `${API_BASE}/api/users`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to save admin user');
      return;
    }

    setShowModal(false);
    fetchUsers();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Access Control Matrix</span>
          <h1 className="text-2xl font-extrabold text-on-surface">User & Permission Management</h1>
          <p className="text-xs text-on-surface-variant">Configure SuperAdmins, Admins, and granular Delegated Admin privileges.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary-fixed-dim text-on-primary text-xs font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>Add Admin User</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-glass-border">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container text-on-surface-variant font-bold border-b border-glass-border uppercase tracking-wider">
              <tr>
                <th className="p-4">User Name & Email</th>
                <th className="p-4">Security Role</th>
                <th className="p-4">Assigned Delegated Permissions</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm text-on-surface">{u.name}</div>
                    <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      u.role === 'SuperAdmin'
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : u.role === 'Admin'
                        ? 'bg-secondary/10 text-secondary border-secondary/30'
                        : 'bg-surface-container text-on-surface-variant border-glass-border'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.role === 'SuperAdmin' || u.role === 'Admin' ? (
                      <span className="text-[11px] text-primary font-bold">★ Full System Access</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.permissions?.canManageJobs && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-glass-border">Jobs</span>}
                        {u.permissions?.canViewApplications && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-glass-border">Applications</span>}
                        {u.permissions?.canManageServices && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-glass-border">Services</span>}
                        {u.permissions?.canManageClients && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-glass-border">Clients</span>}
                        {u.permissions?.canViewInquiries && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-glass-border">Inquiries</span>}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-glass-border transition-all"
                        title="Edit User & Permissions"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      {u.email !== 'superadmin@abishreehr.com' && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 transition-all"
                          title="Delete User"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Modal */}
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
              {editingId ? 'Edit Admin Account' : 'Create Admin Account'}
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Sen"
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anand@abishreehr.com"
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  {editingId ? 'New Password (leave blank to keep existing)' : 'Account Password *'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Security Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
                >
                  <option value="DelegatedAdmin">DelegatedAdmin (Selective Permissions)</option>
                  <option value="Admin">Admin (Full Operational Access)</option>
                  <option value="SuperAdmin">SuperAdmin (Full Access + User Management)</option>
                </select>
              </div>

              {role === 'DelegatedAdmin' && (
                <div className="p-4 bg-surface-container border border-glass-border rounded-2xl flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface mb-1">Granular Delegation Permissions:</span>
                  
                  <label className="flex items-center gap-2.5 text-xs text-on-surface font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canManageJobs}
                      onChange={(e) => setCanManageJobs(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded"
                    />
                    <span>Can Manage Job Openings (`canManageJobs`)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-on-surface font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canViewApplications}
                      onChange={(e) => setCanViewApplications(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded"
                    />
                    <span>Can View Job Applications (`canViewApplications`)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-on-surface font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canManageServices}
                      onChange={(e) => setCanManageServices(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded"
                    />
                    <span>Can Edit HR Services (`canManageServices`)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-on-surface font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canManageClients}
                      onChange={(e) => setCanManageClients(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded"
                    />
                    <span>Can Manage Partners & Testimonials (`canManageClients`)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-on-surface font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canViewInquiries}
                      onChange={(e) => setCanViewInquiries(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded"
                    />
                    <span>Can View Contact Inquiries (`canViewInquiries`)</span>
                  </label>
                </div>
              )}

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
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
