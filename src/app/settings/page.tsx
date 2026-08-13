'use client';

import React, { useEffect, useState } from 'react';

export default function SettingsCMSPage() {
  const [settings, setSettings] = useState<any>({
    companyName: 'Abishree HR Consultants',
    officeAddress: 'Level 7, Infinity Glass Towers, Cyber City, Bangalore - 560100',
    contactEmail: 'contact@abishreehr.com',
    contactPhone: '+91 98765 00112',
    operatingHours: 'Mon - Fri: 9:00 AM – 7:00 PM IST',
    statutoryLicense: 'HR-REG-KA-2024-88912',
    poshPolicyVersion: 'v4.2 (2026 Edition)',
    linkedinUrl: 'https://linkedin.com/company/abishree-hr',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    fetch('http://localhost:5001/api/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('cms_token');
    await fetch('http://localhost:5001/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(settings)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <span className="text-xs font-extrabold text-tertiary uppercase tracking-wider block mb-1">Global Configuration</span>
        <h1 className="text-2xl font-extrabold text-on-surface">Site Settings & Corporate Metadata</h1>
        <p className="text-xs text-on-surface-variant">Customize company information, portal addresses, compliance IDs, and social links.</p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Settings saved successfully to Cloudflare D1!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl border border-glass-border">
        
        {/* Core Company Details */}
        <div>
          <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
            <span>Corporate Identity</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Company Legal Name</label>
              <input
                type="text"
                value={settings.companyName || ''}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Primary Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contact & Hours */}
        <div className="pt-4 border-t border-glass-border">
          <h3 className="text-xs font-extrabold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Communication & Operating Schedule</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Official Phone Number</label>
              <input
                type="text"
                value={settings.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Advisory Operating Hours</label>
              <input
                type="text"
                value={settings.operatingHours || ''}
                onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
                className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Headquarters Address */}
        <div className="pt-4 border-t border-glass-border">
          <h3 className="text-xs font-extrabold text-tertiary uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span>Headquarters Location</span>
          </h3>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Corporate Office Address</label>
            <input
              type="text"
              value={settings.officeAddress || ''}
              onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
              className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Regulatory & Compliance */}
        <div className="pt-4 border-t border-glass-border">
          <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Statutory & Compliance Registrations</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Manpower License / Registration No.</label>
              <input
                type="text"
                value={settings.statutoryLicense || ''}
                onChange={(e) => setSettings({ ...settings, statutoryLicense: e.target.value })}
                className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">POSH Governance Version</label>
              <input
                type="text"
                value={settings.poshPolicyVersion || ''}
                onChange={(e) => setSettings({ ...settings, poshPolicyVersion: e.target.value })}
                className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-glass-border flex justify-end">
          <button 
            type="submit" 
            className="cursor-pointer bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save Configuration to D1</span>
          </button>
        </div>
      </form>
    </div>
  );
}
