/**
 * page — Qantum Module
 * @module page
 * @path src/infrastructure/apps/dashboard/src/app/tests/page.tsx
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
  Filter, 
  MoreHorizontal, 
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  duration: string;
  lastRun: string;
  priority: 'high' | 'medium' | 'low';
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestCase[];
  expanded: boolean;
}

const mockSuites: TestSuite[] = [
  {
    id: '1',
    name: 'Authentication',
    expanded: true,
    tests: [
      { id: '1-1', name: 'User can login with valid credentials', status: 'passed', duration: '2.3s', lastRun: '2 hours ago', priority: 'high' },
      { id: '1-2', name: 'User cannot login with invalid password', status: 'passed', duration: '1.8s', lastRun: '2 hours ago', priority: 'high' },
      { id: '1-3', name: 'User can register new account', status: 'failed', duration: '4.5s', lastRun: '2 hours ago', priority: 'high' },
      { id: '1-4', name: 'Password reset flow works correctly', status: 'passed', duration: '3.2s', lastRun: '2 hours ago', priority: 'medium' },
      { id: '1-5', name: 'OAuth login with Google', status: 'pending', duration: '-', lastRun: 'Never', priority: 'medium' },
    ]
  },
  {
    id: '2',
    name: 'Dashboard',
    expanded: true,
    tests: [
      { id: '2-1', name: 'Dashboard loads with correct data', status: 'passed', duration: '1.5s', lastRun: '1 hour ago', priority: 'high' },
      { id: '2-2', name: 'Stats cards display correctly', status: 'passed', duration: '0.8s', lastRun: '1 hour ago', priority: 'medium' },
      { id: '2-3', name: 'Chart renders with mock data', status: 'passed', duration: '1.2s', lastRun: '1 hour ago', priority: 'low' },
      { id: '2-4', name: 'Recent runs table pagination', status: 'skipped', duration: '-', lastRun: '3 days ago', priority: 'low' },
    ]
  },
  {
    id: '3',
    name: 'API Integration',
    expanded: false,
    tests: [
      { id: '3-1', name: 'GET /api/tests returns test list', status: 'passed', duration: '0.5s', lastRun: '30 min ago', priority: 'high' },
      { id: '3-2', name: 'POST /api/tests creates new test', status: 'passed', duration: '0.7s', lastRun: '30 min ago', priority: 'high' },
      { id: '3-3', name: 'DELETE /api/tests removes test', status: 'failed', duration: '0.3s', lastRun: '30 min ago', priority: 'medium' },
      { id: '3-4', name: 'Rate limiting works correctly', status: 'passed', duration: '2.1s', lastRun: '30 min ago', priority: 'high' },
    ]
  },
  {
    id: '4',
    name: 'E2E User Flows',
    expanded: false,
    tests: [
      { id: '4-1', name: 'Complete checkout flow', status: 'passed', duration: '8.2s', lastRun: '5 hours ago', priority: 'high' },
      { id: '4-2', name: 'User profile update', status: 'passed', duration: '3.4s', lastRun: '5 hours ago', priority: 'medium' },
      { id: '4-3', name: 'Search and filter products', status: 'failed', duration: '5.1s', lastRun: '5 hours ago', priority: 'high' },
      { id: '4-4', name: 'Add to cart and remove', status: 'passed', duration: '2.8s', lastRun: '5 hours ago', priority: 'high' },
      { id: '4-5', name: 'Wishlist functionality', status: 'pending', duration: '-', lastRun: 'Never', priority: 'low' },
    ]
  }
];

const statusIcons = {
  passed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  skipped: <AlertTriangle className="h-4 w-4 text-gray-500" />,
};

const statusColors = {
  passed: 'bg-green-500/10 text-green-500',
  failed: 'bg-red-500/10 text-red-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
  skipped: 'bg-gray-500/10 text-gray-500',
};

const priorityColors = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function TestsPage() {
  const [suites, setSuites] = useState(mockSuites);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSuite = (suiteId: string) => {
    // Complexity: O(1)
    setSuites(prev => prev.map(suite => 
      suite.id === suiteId ? { ...suite, expanded: !suite.expanded } : suite
    ));
  };

  const toggleTestSelection = (testId: string) => {
    // Complexity: O(1)
    setSelectedTests(prev => 
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const totalTests = suites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = suites.reduce((acc, suite) => acc + suite.tests.filter(t => t.status === 'passed').length, 0);
  const failedTests = suites.reduce((acc, suite) => acc + suite.tests.filter(t => t.status === 'failed').length, 0);
  const pendingTests = suites.reduce((acc, suite) => acc + suite.tests.filter(t => t.status === 'pending').length, 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Cases</h1>
            <p className="text-muted-foreground">
              Manage and organize your test suites
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700">
              <Plus className="h-4 w-4" />
              New Test
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tests</span>
                <span className="text-2xl font-bold">{totalTests}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">Passed</span>
                <span className="text-2xl font-bold text-green-400">{passedTests}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-400">Failed</span>
                <span className="text-2xl font-bold text-red-400">{failedTests}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-400">Pending</span>
                <span className="text-2xl font-bold text-yellow-400">{pendingTests}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Test Suites */}
        <div className="space-y-4">
          {suites.map((suite) => (
            <Card key={suite.id} className="bg-slate-900/50 border-slate-800 overflow-hidden">
              {/* Suite Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => toggleSuite(suite.id)}
              >
                <div className="flex items-center gap-3">
                  {suite.expanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <FolderOpen className="h-5 w-5 text-violet-400" />
                  <span className="font-semibold">{suite.name}</span>
                  <span className="text-sm text-muted-foreground">({suite.tests.length} tests)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-400">{suite.tests.filter(t => t.status === 'passed').length} passed</span>
                  <span className="text-sm text-red-400">{suite.tests.filter(t => t.status === 'failed').length} failed</span>
                  <Button variant="ghost" size="sm" className="ml-4" onClick={(e) => { e.stopPropagation(); }}>
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tests List */}
              {suite.expanded && (
                <div className="border-t border-slate-800">
                  {suite.tests.map((test) => (
                    <div 
                      key={test.id}
                      className="flex items-center justify-between p-4 pl-12 hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-b-0"
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedTests.includes(test.id)}
                          onChange={() => toggleTestSelection(test.id)}
                          className="rounded border-slate-700"
                        />
                        {statusIcons[test.status]}
                        <FileCode className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm">{test.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${priorityColors[test.priority]}`}>
                          {test.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>{test.duration}</span>
                        <span>{test.lastRun}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[test.status]}`}>
                          {test.status}
                        </span>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedTests.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl flex items-center gap-4">
            <span className="text-sm">{selectedTests.length} tests selected</span>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Run Selected
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedTests([])}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
