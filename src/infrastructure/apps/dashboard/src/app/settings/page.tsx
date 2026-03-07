/**
 * page — Qantum Module
 * @module page
 * @path src/infrastructure/apps/dashboard/src/app/settings/page.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings,
  User,
  Bell,
  Shield,
  Key,
  Palette,
  Globe,
  Code,
  Webhook,
  Database,
  CreditCard,
  Users,
  Building,
  Mail,
  Slack,
  Github,
  Check,
  ChevronRight,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

type SettingsTab = 'profile' | 'team' | 'notifications' | 'integrations' | 'api' | 'billing' | 'appearance';

const tabs: { id: SettingsTab; label: string; icon: any }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'api', label: 'API & Webhooks', icon: Code },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const integrations = [
  { id: 'github', name: 'GitHub', icon: Github, connected: true, description: 'Trigger tests on push/PR' },
  { id: 'slack', name: 'Slack', icon: Slack, connected: true, description: 'Get notifications in channels' },
  { id: 'jira', name: 'Jira', icon: Building, connected: false, description: 'Sync test results with issues' },
  { id: 'email', name: 'Email', icon: Mail, connected: true, description: 'Email reports and alerts' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'text-muted-foreground hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-bold">
                      DP
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                        <input 
                          type="text" 
                          defaultValue="Dimitar"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
                        <input 
                          type="text" 
                          defaultValue="Prodromov"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                      <input 
                        type="email" 
                        defaultValue="papica777@gmail.com"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Organization</label>
                      <input 
                        type="text" 
                        defaultValue="Aeterna Empire"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-violet-600 to-cyan-600">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Manage who has access to this workspace</CardDescription>
                    </div>
                    <Button className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-600">
                      <User className="h-4 w-4" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Dimitar Prodromov', email: 'papica777@gmail.com', role: 'Owner', avatar: 'DP' },
                      { name: 'Alex Developer', email: 'alex@example.com', role: 'Admin', avatar: 'AD' },
                      { name: 'Maria Tester', email: 'maria@example.com', role: 'Member', avatar: 'MT' },
                    ].map((member, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.role === 'Owner' ? 'bg-violet-500/20 text-violet-400' :
                            member.role === 'Admin' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {member.role}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'Test run completed', description: 'Get notified when a test run finishes', email: true, slack: true },
                    { label: 'Test failures', description: 'Alert when tests fail', email: true, slack: true },
                    { label: 'Weekly summary', description: 'Weekly report of test metrics', email: true, slack: false },
                    { label: 'New team member', description: 'When someone joins your team', email: true, slack: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked={item.email} className="rounded" />
                          Email
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked={item.slack} className="rounded" />
                          Slack
                        </label>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect Aeterna with your tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                          <integration.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      {integration.connected ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-sm text-green-400">
                            <Check className="h-4 w-4" />
                            Connected
                          </span>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      ) : (
                        <Button variant="outline">Connect</Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* API Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage your API keys for programmatic access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Production Key</span>
                        <span className="text-xs text-muted-foreground">Created Jan 1, 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-slate-900 rounded font-mono text-sm">
                          qntm_prod_••••••••••••••••
                        </code>
                        <Button variant="outline" size="sm">Copy</Button>
                        <Button variant="destructive" size="sm">Revoke</Button>
                      </div>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Key className="h-4 w-4" />
                      Generate New Key
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Receive events via HTTP POST</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">https://api.example.com/webhooks/aeterna</p>
                          <p className="text-sm text-muted-foreground">Events: test.completed, test.failed</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-green-400">
                          <Check className="h-4 w-4" />
                          Active
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Webhook className="h-4 w-4" />
                      Add Webhook
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-lg">
                      <div>
                        <p className="text-xl font-bold">Pro Plan</p>
                        <p className="text-muted-foreground">$49/month • Unlimited tests • 5 team members</p>
                      </div>
                      <Button variant="outline">Upgrade</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle>Usage This Month</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Test Runs</span>
                        <span>423 / Unlimited</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-violet-500 to-cyan-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Parallel Executions</span>
                        <span>6 / 10</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-3/5 bg-gradient-to-r from-violet-500 to-cyan-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how Aeterna looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-4 block">Theme</label>
                    <div className="flex gap-4">
                      {[
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'system', label: 'System', icon: Monitor },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id as any)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            theme === t.id 
                              ? 'border-violet-500 bg-violet-500/10' 
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <t.icon className="h-6 w-6" />
                          <span className="text-sm">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-4 block">Accent Color</label>
                    <div className="flex gap-3">
                      {['violet', 'cyan', 'green', 'orange', 'pink'].map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full bg-${color}-500 ring-2 ring-offset-2 ring-offset-slate-900 ${color === 'violet' ? 'ring-white' : 'ring-transparent hover:ring-slate-500'}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
