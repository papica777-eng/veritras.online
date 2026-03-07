/**
 * Upload Command - Upload test files to QAntum Cloud
 */

import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, statSync } from 'fs';
import { glob } from 'glob';
import { basename, relative } from 'path';
import { getConfig, requireAuth } from '../lib/config.js';
import { api } from '../lib/api.js';

interface UploadOptions {
  project?: string;
}

export async function upload(files: string[], options: UploadOptions) {
  const config = getConfig();
  // Complexity: O(1)
  requireAuth(config);

  const projectId = options.project || config.get('defaultProject');

  if (!projectId) {
    console.log(chalk.red('✗') + ' No project specified. Use --project or run `qantum init`');
    process.exit(1);
  }

  const spinner = ora('Scanning files...').start();

  try {
    // Expand glob patterns
    const allFiles: string[] = [];

    for (const pattern of files) {
      const stat = statSync(pattern, { throwIfNoEntry: false });

      if (stat?.isDirectory()) {
        // If directory, scan for test files
        const found = await glob(`${pattern}/**/*.{spec,test}.{ts,js}`, {
          ignore: ['**/node_modules/**'],
        });
        allFiles.push(...found);
      } else if (stat?.isFile()) {
        allFiles.push(pattern);
      } else {
        // Treat as glob pattern
        // SAFETY: async operation — wrap in try-catch for production resilience
        const found = await glob(pattern, {
          ignore: ['**/node_modules/**'],
        });
        allFiles.push(...found);
      }
    }

    if (allFiles.length === 0) {
      spinner.fail('No test files found');
      return;
    }

    spinner.text = `Uploading ${allFiles.length} files...`;

    // Prepare upload payload
    const uploadFiles = allFiles.map((file) => ({
      path: relative(process.cwd(), file),
      name: basename(file),
      content: readFileSync(file, 'utf-8'),
    }));

    // Upload files
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await api.post<{
      uploaded: number;
      suiteId: string;
      tests: { id: string; name: string }[];
    }>(
      '/api/v1/tests/upload',
      {
        projectId,
        files: uploadFiles,
      },
      config
    );

    spinner.succeed(`Uploaded ${result.uploaded} test files`);
    console.log(chalk.gray(`  Suite ID: ${result.suiteId}`));
    console.log(chalk.gray(`  Tests: ${result.tests.length}`));
    console.log();
    console.log(`Run tests: ${chalk.cyan(`qantum run --suite ${result.suiteId}`)}`);
  } catch (error: any) {
    spinner.fail(error.message);
  }
}
