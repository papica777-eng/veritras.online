/**
 * @fileoverview Breadcrumbs Component
 * @description Navigation breadcrumbs with automatic route detection
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Route labels mapping
const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  tests: 'Test Cases',
  runs: 'Test Runs',
  projects: 'Projects',
  generate: 'AI Generator',
  healing: 'Self-Healing',
  logs: 'Logs',
  settings: 'Settings',
  billing: 'Billing',
  new: 'New',
  edit: 'Edit',
};

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, showHome = true, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items) return items;

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  }, [items, pathname]);

  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center gap-1">
        {showHome && (
          <li>
            <Link
              href="/"
              className={cn(
                'flex items-center gap-1 text-gray-400 hover:text-white transition-colors',
                pathname === '/' && 'text-white'
              )}
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-600 mx-1" />
            {index === breadcrumbItems.length - 1 ? (
              <span className="text-white font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Breadcrumb wrapper for page headers
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
}

export function PageHeader({ title, description, children, breadcrumbItems }: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && (
            <p className="text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}
