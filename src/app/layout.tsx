'use client';

import { API_BASE } from '@/config/api';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('abishree_theme');
    if (stored === 'light') {
      setIsDarkTheme(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkTheme(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = !isDarkTheme;
    setIsDarkTheme(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('abishree_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('abishree_theme', 'light');
    }
  };

  const fetchSession = () => {
    const token = localStorage.getItem('cms_token');
    if (!token) {
      setAdminUser(null);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setAdminUser(data.user);
        else {
          localStorage.removeItem('cms_token');
          setAdminUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('cms_token', data.token);
      setAdminUser(data.user);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cms_token');
    setAdminUser(null);
    setMobileDrawerOpen(false);
  };

  // Helper check for navigation links
  const hasPermission = (key: string) => {
    if (!adminUser) return false;
    if (adminUser.role === 'SuperAdmin' || adminUser.role === 'Admin') return true;
    return adminUser.permissions && adminUser.permissions[key] === true;
  };

  const navLinks = [
    { label: 'Dashboard Overview', href: '/', icon: 'dashboard', show: true },
    { label: 'User & Permissions', href: '/users', icon: 'manage_accounts', show: adminUser?.role === 'SuperAdmin' },
    { label: 'Manage Jobs', href: '/jobs', icon: 'work', show: hasPermission('canManageJobs') },
    { label: 'Job Applications', href: '/applications', icon: 'badge', show: hasPermission('canViewApplications') },
    { label: 'HR Services', href: '/services', icon: 'design_services', show: hasPermission('canManageServices') },
    { label: 'Clients & Partners', href: '/clients', icon: 'handshake', show: hasPermission('canManageClients') },
    { label: 'Contact Inquiries', href: '/inquiries', icon: 'inbox', show: hasPermission('canViewInquiries') },
    { label: 'Site Settings', href: '/settings', icon: 'settings', show: adminUser?.role === 'SuperAdmin' || adminUser?.role === 'Admin' },
  ];

  // Primary bottom dock links
  const dockLinks = [
    { label: 'Overview', href: '/', icon: 'dashboard', show: true },
    { label: 'Jobs', href: '/jobs', icon: 'work', show: hasPermission('canManageJobs') },
    { label: 'Apps', href: '/applications', icon: 'badge', show: hasPermission('canViewApplications') },
    { label: 'Inquiries', href: '/inquiries', icon: 'inbox', show: hasPermission('canViewInquiries') },
  ].filter(l => l.show);

  // Helper to extract 2-letter initials from admin name
  const getAdminInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>Abishree HR | CMS Portal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" 
        />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Symbols+Outlined" 
        />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" 
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('abishree_theme');
                if (storedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
        
        {!adminUser ? (
          /* Admin Login Screen */
          <div className="flex-1 flex items-center justify-center p-6 bg-surface">
            <div className="w-full max-w-md glass-card p-8 sm:p-10 rounded-3xl shadow-2xl relative">
              
              {/* Theme toggle on Login */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className="cursor-pointer absolute top-6 right-6 p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-glass-border text-primary transition-all shadow-sm"
                  title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isDarkTheme ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-on-primary border border-glass-border shadow-md">
                  <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
                </div>
                <div>
                  <h1 className="font-extrabold text-lg text-primary leading-tight">Abishree HR CMS</h1>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block font-bold">Admin Portal</span>
                </div>
              </div>

              {loginError && (
                <div className="mb-4 p-3.5 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superadmin@abishreehr.com"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Admin Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="cursor-pointer mt-2 bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loggingIn ? 'Authenticating...' : 'Sign In to CMS Portal'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-glass-border text-[11px] text-on-surface-variant flex flex-col gap-1.5 bg-surface-container/50 p-3.5 rounded-xl">
                <span className="font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">key</span> Demo Credentials:
                </span>
                <span>• SuperAdmin: <code className="font-semibold text-on-surface">superadmin@abishreehr.com</code> / <code className="font-semibold text-on-surface">SuperAdmin@123</code></span>
                <span>• Admin: <code className="font-semibold text-on-surface">admin@abishreehr.com</code> / <code className="font-semibold text-on-surface">Admin@12345</code></span>
                <span>• Delegated: <code className="font-semibold text-on-surface">recruiter@abishreehr.com</code> / <code className="font-semibold text-on-surface">Recruiter@123</code></span>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Layout */
          <div className="flex-1 flex flex-col md:flex-row min-w-0 min-h-screen">
            
            {/* ---------------- MOBILE TOP NAVIGATION BAR ---------------- */}
            <header className="md:hidden sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-glass-border px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-on-primary border border-glass-border shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                </div>
                <div>
                  <h1 className="font-extrabold text-xs text-primary leading-tight">Abishree HR</h1>
                  <span className="text-[9px] text-tertiary uppercase tracking-widest font-bold block">{adminUser.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    className="cursor-pointer p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-glass-border text-primary transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isDarkTheme ? 'light_mode' : 'dark_mode'}
                    </span>
                  </button>
                )}

                {/* Profile Drawer / Hamburger Trigger */}
                <button
                  onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                  aria-label="Open Admin Menu"
                  className="cursor-pointer flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl bg-surface-container border border-glass-border hover:border-primary transition-all active:scale-95"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black border border-glass-border">
                    {getAdminInitials(adminUser.name)}
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-on-surface">
                    {mobileDrawerOpen ? 'close' : 'menu'}
                  </span>
                </button>
              </div>
            </header>

            {/* ---------------- MOBILE SLIDE-OUT DRAWER / PROFILE MODAL ---------------- */}
            {mobileDrawerOpen && (
              <div className="md:hidden fixed inset-0 z-50 flex">
                {/* Backdrop Overlay */}
                <div 
                  className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity animate-in fade-in"
                  onClick={() => setMobileDrawerOpen(false)}
                />

                {/* Drawer Content */}
                <div className="relative w-4/5 max-w-xs bg-surface-container-low border-r border-glass-border shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-300 overflow-y-auto">
                  <div className="flex flex-col gap-5">
                    
                    {/* Drawer Header & Profile Card */}
                    <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-on-primary font-black text-xs shadow-sm">
                          {getAdminInitials(adminUser.name)}
                        </div>
                        <div>
                          <div className="text-xs font-black text-on-surface truncate">{adminUser.name}</div>
                          <span className="text-[10px] text-primary font-extrabold uppercase tracking-wider">{adminUser.role}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setMobileDrawerOpen(false)}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>

                    {/* Admin Email Box */}
                    <div className="p-2.5 rounded-xl bg-surface-container border border-glass-border flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">mail</span>
                      <span className="text-[11px] text-on-surface-variant truncate font-medium">{adminUser.email}</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest px-2 mb-1">
                        CMS Navigation
                      </span>
                      {navLinks.filter(l => l.show).map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className={`cursor-pointer flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                              isActive
                                ? 'bg-primary text-on-primary border-primary shadow-sm'
                                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container border-transparent'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="pt-4 mt-6 border-t border-glass-border flex flex-col gap-2.5">
                    <a
                      href="http://localhost:3000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer w-full bg-surface-container hover:bg-surface-container-high border border-glass-border text-primary text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      <span>View Public Site</span>
                    </a>

                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/30 text-tertiary text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- DESKTOP SIDEBAR ---------------- */}
            <aside className="w-64 bg-surface-container-low border-r border-glass-border p-6 flex flex-col justify-between hidden md:flex shrink-0 transition-colors duration-300">
              <div>
                <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-glass-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-on-primary border border-glass-border shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                    </div>
                    <div>
                      <h1 className="font-extrabold text-sm text-primary leading-tight">Abishree HR</h1>
                      <span className="text-[10px] text-tertiary uppercase tracking-widest font-bold">{adminUser.role}</span>
                    </div>
                  </div>

                  {/* Theme toggle */}
                  {mounted && (
                    <button
                      onClick={toggleTheme}
                      aria-label="Toggle Theme"
                      className="cursor-pointer p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-glass-border text-primary transition-all shadow-sm"
                      title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isDarkTheme ? 'light_mode' : 'dark_mode'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-3 mb-6 bg-surface-container border border-glass-border rounded-xl">
                  <div className="text-xs font-bold text-on-surface truncate">{adminUser.name}</div>
                  <div className="text-[10px] text-on-surface-variant truncate font-medium">{adminUser.email}</div>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {navLinks.filter(l => l.show).map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`cursor-pointer flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container border-transparent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-glass-border flex flex-col gap-3">
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer w-full bg-surface-container hover:bg-surface-container-high border border-glass-border text-primary text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>View Public Site</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/30 text-tertiary text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Log Out</span>
                </button>
              </div>
            </aside>

            {/* ---------------- MAIN WORKSPACE ---------------- */}
            <main className="flex-1 p-4 sm:p-6 md:p-10 pb-28 md:pb-10 overflow-y-auto bg-surface transition-colors duration-300">
              {children}
            </main>

            {/* ---------------- FLOATING BOTTOM DOCK FOR MOBILE NAVIGATION ---------------- */}
            <div className="md:hidden fixed bottom-3 left-3 right-3 z-40">
              <nav className="bg-surface-container-high/95 backdrop-blur-2xl border border-glass-border shadow-2xl rounded-2xl p-1.5 flex items-center justify-around gap-1">
                {dockLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`cursor-pointer flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all flex-1 ${
                        isActive
                          ? 'bg-primary text-on-primary shadow-md scale-102 font-extrabold'
                          : 'text-on-surface-variant hover:text-primary active:scale-95 font-medium'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] mb-0.5">{link.icon}</span>
                      <span className="text-[10px] tracking-tight">{link.label}</span>
                    </Link>
                  );
                })}

                {/* More / Profile Trigger on Dock */}
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  className={`cursor-pointer flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all flex-1 ${
                    mobileDrawerOpen
                      ? 'bg-secondary text-on-secondary shadow-md'
                      : 'text-on-surface-variant hover:text-primary active:scale-95 font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-0.5">menu_open</span>
                  <span className="text-[10px] tracking-tight">More</span>
                </button>
              </nav>
            </div>

          </div>
        )}

      </body>
    </html>
  );
}
