/**
 * Seed script for demo data
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { clerkId: 'demo-tenant' },
    update: {},
    create: {
      clerkId: 'demo-tenant',
      name: 'Demo Tenant',
      email: 'demo@example.com',
    },
  });

  // Create project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      name: 'Demo Project',
      description: 'A demo QA project',
      url: 'https://example.com',
      tenantId: tenant.id,
    },
  });

  // Create test suite
  const suite = await prisma.testSuite.upsert({
    where: { id: 'demo-suite' },
    update: {},
    create: {
      id: 'demo-suite',
      name: 'Demo Test Suite',
      description: 'Demo tests',
      projectId: project.id,
    },
  });

  // Create sample tests
  const tests = [
    {
      id: 'test-1',
      name: 'Navigate to homepage',
      description: 'Test basic navigation',
      code: `
        await page.goto('https://example.com');
        const title = await page.title();
        if (!title.includes('Example')) {
          throw new Error('Title does not contain Example');
        }
      `,
      suiteId: suite.id,
    },
    {
      id: 'test-2',
      name: 'Check heading',
      description: 'Verify main heading',
      code: `
        await page.goto('https://example.com');
        const heading = await page.locator('h1').textContent();
        if (!heading) {
          throw new Error('No heading found');
        }
      `,
      suiteId: suite.id,
    },
    {
      id: 'test-3',
      name: 'Check links',
      description: 'Verify links exist',
      code: `
        await page.goto('https://example.com');
        const links = await page.locator('a').count();
        if (links < 1) {
          throw new Error('No links found');
        }
      `,
      suiteId: suite.id,
    },
  ];

  for (const test of tests) {
    await prisma.test.upsert({
      where: { id: test.id },
      update: {},
      create: test,
    });
  }

  console.log('Seeding completed!');
  console.log(`Created tenant: ${tenant.id}`);
  console.log(`Created project: ${project.id}`);
  console.log(`Created suite: ${suite.id}`);
  console.log(`Created ${tests.length} tests`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
