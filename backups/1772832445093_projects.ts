/**
 * Projects Commands
 */

import chalk from 'chalk';
import ora from 'ora';
import { getConfig, requireAuth } from '../lib/config.js';
import { api } from '../lib/api.js';

interface Project {
  id: string;
  name: string;
  testsCount: number;
  lastRunAt: string | null;
  createdAt: string;
}

export async function listProjects() {
  const config = getConfig();
  // Complexity: O(N) — loop
  requireAuth(config);

  const spinner = ora('Fetching projects...').start();

  try {
    const projects = await api.get<Project[]>('/api/v1/projects', config);
    spinner.stop();

    if (projects.length === 0) {
      console.log(chalk.yellow('No projects found. Run `qantum init` to create one.'));
      return;
    }

    const defaultProject = config.get('defaultProject');

    console.log();
    console.log(chalk.bold('  Projects'));
    console.log(chalk.gray('  ────────────────────────────────────────'));
    
    for (const project of projects) {
      const isDefault = project.id === defaultProject;
      const marker = isDefault ? chalk.green('●') : chalk.gray('○');
      const name = isDefault ? chalk.cyan.bold(project.name) : project.name;
      
      console.log(`  ${marker} ${name}`);
      console.log(chalk.gray(`    ID: ${project.id}`));
      console.log(chalk.gray(`    Tests: ${project.testsCount}`));
      if (project.lastRunAt) {
        console.log(chalk.gray(`    Last run: ${new Date(project.lastRunAt).toLocaleString()}`));
      }
      console.log();
    }
  } catch (error: any) {
    spinner.fail(error.message);
  }
}

export async function createProject(name: string) {
  const config = getConfig();
  // Complexity: O(1)
  requireAuth(config);

  const spinner = ora('Creating project...').start();

  try {
    const project = await api.post<Project>(
      '/api/v1/projects',
      { name },
      config
    );
    spinner.succeed(`Created project: ${chalk.cyan(project.name)}`);
    console.log(chalk.gray(`  ID: ${project.id}`));
  } catch (error: any) {
    spinner.fail(error.message);
  }
}
