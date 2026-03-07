/**
 * page — Qantum Module
 * @module page
 * @path src/infrastructure/apps/dashboard/src/app/projects/page.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Folder,
  FolderOpen,
  Settings,
  Users,
  Calendar,
  Activity,
  GitBranch,
  ExternalLink,
  Star,
  StarOff,
  Archive,
  Trash2
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  testsCount: number;
  runsCount: number;
  passRate: number;
  lastActivity: string;
  members: number;
  status: 'active' | 'archived';
  favorite: boolean;
  color: string;
}

const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'E-Commerce Platform',
    description: 'Main e-commerce application with checkout, payments, and inventory',
    testsCount: 248,
    runsCount: 156,
    passRate: 94.2,
    lastActivity: '5 minutes ago',
    members: 8,
    status: 'active',
    favorite: true,
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'proj-002',
    name: 'Mobile API',
    description: 'REST API for iOS and Android mobile applications',
    testsCount: 127,
    runsCount: 89,
    passRate: 98.5,
    lastActivity: '2 hours ago',
    members: 4,
    status: 'active',
    favorite: true,
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'proj-003',
    name: 'Admin Dashboard',
    description: 'Internal admin panel for customer support and operations',
    testsCount: 86,
    runsCount: 45,
    passRate: 91.3,
    lastActivity: '1 day ago',
    members: 3,
    status: 'active',
    favorite: false,
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 'proj-004',
    name: 'Payment Gateway',
    description: 'Stripe and PayPal integration microservice',
    testsCount: 64,
    runsCount: 112,
    passRate: 99.1,
    lastActivity: '3 hours ago',
    members: 5,
    status: 'active',
    favorite: false,
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'proj-005',
    name: 'Legacy CRM',
    description: 'Old customer relationship management system - migrating',
    testsCount: 42,
    runsCount: 23,
    passRate: 76.4,
    lastActivity: '2 weeks ago',
    members: 2,
    status: 'archived',
    favorite: false,
    color: 'from-gray-500 to-gray-600'
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const toggleFavorite = (projectId: string) => {
    // Complexity: O(1)
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, favorite: !p.favorite } : p
    ));
  };

  const filteredProjects = projects
    .filter(p => showArchived ? true : p.status === 'active')
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return 0;
    });

  const totalTests = projects.filter(p => p.status === 'active').reduce((acc, p) => acc + p.testsCount, 0);
  const totalRuns = projects.filter(p => p.status === 'active').reduce((acc, p) => acc + p.runsCount, 0);
  const avgPassRate = projects.filter(p => p.status === 'active').reduce((acc, p) => acc + p.passRate, 0) / projects.filter(p => p.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Organize tests by project and team
            </p>
          </div>
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-violet-400" />
                  <span className="text-sm text-muted-foreground">Active Projects</span>
                </div>
                <span className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-muted-foreground">Total Tests</span>
                </div>
                <span className="text-2xl font-bold">{totalTests}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-muted-foreground">Total Runs</span>
                </div>
                <span className="text-2xl font-bold">{totalRuns}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Avg Pass Rate</span>
                </div>
                <span className="text-2xl font-bold text-emerald-400">{avgPassRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <Button 
            variant={showArchived ? "default" : "outline"} 
            onClick={() => setShowArchived(!showArchived)}
            className="gap-2"
          >
            <Archive className="h-4 w-4" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className={`bg-slate-900/50 border-slate-800 overflow-hidden hover:border-slate-700 transition-all cursor-pointer group ${project.status === 'archived' ? 'opacity-60' : ''}`}
            >
              {/* Color Header */}
              <div className={`h-2 bg-gradient-to-r ${project.color}`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${project.color} bg-opacity-20`}>
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {project.name}
                        {project.status === 'archived' && (
                          <span className="text-xs text-muted-foreground">(archived)</span>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(project.id); }}
                  >
                    {project.favorite ? (
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground group-hover:text-yellow-400" />
                    )}
                  </Button>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{project.testsCount}</p>
                    <p className="text-xs text-muted-foreground">Tests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{project.runsCount}</p>
                    <p className="text-xs text-muted-foreground">Runs</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${project.passRate >= 95 ? 'text-green-400' : project.passRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {project.passRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Pass Rate</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.members}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{project.lastActivity}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Project Card */}
          <Card className="bg-slate-900/30 border-slate-800 border-dashed hover:border-violet-500/50 transition-all cursor-pointer group flex items-center justify-center min-h-[280px]">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-500/20 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-violet-400" />
              </div>
              <p className="text-muted-foreground group-hover:text-violet-400">Create New Project</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
