/**
 * Genesis CLI Commands - КОМАНДНА ЛИНИЯ ЗА ОНТОЛОГИЧНАТА КОВАЧНИЦА
 * 
 * qantum genesis create   - Create a new reality
 * qantum genesis manifest - Manifest reality as Docker environment
 * qantum genesis observe  - Execute tests within a reality
 * qantum genesis list     - List active realities
 * qantum genesis collapse - Destroy a reality
 * qantum genesis status   - Get reality status
 * 
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */

import chalk from 'chalk';
import ora from 'ora';
import { getConfig, requireAuth } from '../lib/config.js';
import { api } from '../lib/api.js';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CreateOptions {
  name: string;
  dimensions: string;
  entropy: string;
  causality: string;
  axioms: string;
  json: boolean;
}

interface ManifestOptions {
  reality: string;
  wait: boolean;
  timeout: string;
  json: boolean;
}

interface ObserveOptions {
  reality: string;
  target?: string;
  code?: string;
  file?: string;
  collapse: boolean;
  json: boolean;
}

interface ListOptions {
  all: boolean;
  json: boolean;
}

interface CollapseOptions {
  force: boolean;
  all: boolean;
}

interface StatusOptions {
  reality: string;
  json: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS CREATE
// ═══════════════════════════════════════════════════════════════════════════════

export async function genesisCreate(options: CreateOptions) {
  const config = getConfig();
  // Complexity: O(N) — linear scan
  requireAuth(config);

  const spinner = ora('Creating reality specification...').start();

  try {
    // Parse axioms from comma-separated string
    const axiomTypes = options.axioms
      ? options.axioms.split(',').map(a => a.trim().toUpperCase())
      : ['IDENTITY', 'CONSERVATION'];

    const payload = {
      name: options.name,
      dimensions: parseInt(options.dimensions, 10) || 4,
      entropy: parseFloat(options.entropy) || 0.1,
      causality: options.causality?.toUpperCase() || 'DETERMINISTIC',
      axiomTypes,
    };

    const result = await api.post<{
      id: string;
      name: string;
      axioms: number;
      dimensions: number;
      status: string;
    }>('/api/v1/genesis/createAxiom', payload, config);

    spinner.succeed(chalk.green('Reality specification created!'));

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log();
      console.log(chalk.magenta('  ⚛️  Genesis Reality Created'));
      console.log();
      console.log(`  ${chalk.dim('ID:')}        ${chalk.cyan(result.id)}`);
      console.log(`  ${chalk.dim('Name:')}      ${result.name}`);
      console.log(`  ${chalk.dim('Axioms:')}    ${result.axioms}`);
      console.log(`  ${chalk.dim('Dimensions:')} ${result.dimensions}D`);
      console.log(`  ${chalk.dim('Status:')}    ${chalk.yellow(result.status)}`);
      console.log();
      console.log(chalk.dim('  To manifest: qantum genesis manifest --reality ' + result.id));
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to create reality'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS MANIFEST
// ═══════════════════════════════════════════════════════════════════════════════

export async function genesisManifest(options: ManifestOptions) {
  const config = getConfig();
  // Complexity: O(N*M) — nested iteration
  requireAuth(config);

  const spinner = ora('Manifesting reality into Docker environment...').start();

  try {
    const result = await api.post<{
      manifestationId: string;
      realityId: string;
      status: string;
      containers: Array<{ name: string; status: string }>;
      network: string;
    }>('/api/v1/genesis/manifestReality', {
      realityId: options.reality,
      timeout: parseInt(options.timeout, 10) || 60,
    }, config);

    if (options.wait) {
      spinner.text = 'Waiting for reality stabilization...';

      // Poll for stability
      let stable = false;
      const maxWait = parseInt(options.timeout, 10) * 1000 || 60000;
      const startTime = Date.now();

      while (!stable && Date.now() - startTime < maxWait) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const status = await api.get<{ status: string }>(
          `/api/v1/genesis/status/${result.manifestationId}`,
          config
        );

        if (status.status === 'STABLE') {
          stable = true;
        } else if (status.status === 'COLLAPSING' || status.status === 'COLLAPSED') {
          throw new Error('Reality collapsed during manifestation');
        } else {
          // SAFETY: async operation — wrap in try-catch for production resilience
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!stable) {
        throw new Error('Reality failed to stabilize within timeout');
      }
    }

    spinner.succeed(chalk.green('Reality manifested!'));

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log();
      console.log(chalk.magenta('  🌌 Reality Manifested'));
      console.log();
      console.log(`  ${chalk.dim('Manifestation ID:')} ${chalk.cyan(result.manifestationId)}`);
      console.log(`  ${chalk.dim('Reality ID:')}       ${result.realityId}`);
      console.log(`  ${chalk.dim('Status:')}          ${chalk.green(result.status)}`);
      console.log(`  ${chalk.dim('Network:')}         ${result.network}`);
      console.log();
      console.log(chalk.dim('  Containers:'));
      for (const container of result.containers) {
        const statusColor = container.status === 'running' ? chalk.green : chalk.yellow;
        console.log(`    ${chalk.dim('•')} ${container.name}: ${statusColor(container.status)}`);
      }
      console.log();
      console.log(chalk.dim('  To observe: qantum genesis observe --reality ' + result.manifestationId));
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to manifest reality'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS OBSERVE
// ═══════════════════════════════════════════════════════════════════════════════

export async function genesisObserve(options: ObserveOptions) {
  const config = getConfig();
  // Complexity: O(1)
  requireAuth(config);

  let testCode = options.code || '';

  // Read from file if provided
  if (options.file) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const fs = await import('fs/promises');
    // SAFETY: async operation — wrap in try-catch for production resilience
    testCode = await fs.readFile(options.file, 'utf-8');
  }

  if (!testCode) {
    console.error(chalk.red('Error: Provide test code via --code or --file'));
    process.exit(1);
  }

  const spinner = ora('Observing reality (executing test)...').start();

  try {
    const result = await api.post<{
      success: boolean;
      duration: number;
      waveformCollapsed: boolean;
      measuredState: Record<string, any>;
      error?: string;
      logs?: string[];
    }>('/api/v1/genesis/observe', {
      realityId: options.reality,
      testCode,
      targetService: options.target || 'api',
      collapseOnObservation: options.collapse,
    }, config);

    if (result.success) {
      spinner.succeed(chalk.green('Observation successful!'));
    } else {
      spinner.fail(chalk.red('Observation failed'));
    }

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log();
      console.log(chalk.magenta('  👁️  Observation Result'));
      console.log();
      console.log(`  ${chalk.dim('Success:')}    ${result.success ? chalk.green('✓') : chalk.red('✗')}`);
      console.log(`  ${chalk.dim('Duration:')}   ${result.duration}ms`);
      console.log(`  ${chalk.dim('Collapsed:')}  ${result.waveformCollapsed ? chalk.yellow('Yes') : 'No'}`);
      
      if (result.error) {
        console.log(`  ${chalk.dim('Error:')}     ${chalk.red(result.error)}`);
      }

      if (Object.keys(result.measuredState).length > 0) {
        console.log();
        console.log(chalk.dim('  Measured State:'));
        for (const [key, value] of Object.entries(result.measuredState)) {
          console.log(`    ${chalk.dim(key + ':')} ${JSON.stringify(value)}`);
        }
      }

      if (result.logs && result.logs.length > 0) {
        console.log();
        console.log(chalk.dim('  Logs:'));
        for (const log of result.logs) {
          console.log(`    ${log}`);
        }
      }
    }

    process.exit(result.success ? 0 : 1);
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to observe reality'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS LIST
// ═══════════════════════════════════════════════════════════════════════════════

export async function genesisList(options: ListOptions) {
  const config = getConfig();
  // Complexity: O(N) — loop
  requireAuth(config);

  const spinner = ora('Fetching active realities...').start();

  try {
    const result = await api.get<{
      realities: Array<{
        id: string;
        name: string;
        status: string;
        dimensions: number;
        containers: number;
        createdAt: string;
      }>;
      total: number;
    }>('/api/v1/genesis/myRealities' + (options.all ? '?all=true' : ''), config);

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log();
      console.log(chalk.magenta(`  🌌 Active Realities (${result.total})`));
      console.log();

      if (result.realities.length === 0) {
        console.log(chalk.dim('  No active realities'));
      } else {
        for (const reality of result.realities) {
          const statusColor = 
            reality.status === 'STABLE' ? chalk.green :
            reality.status === 'MANIFESTING' ? chalk.yellow :
            reality.status === 'UNSTABLE' ? chalk.red :
            chalk.dim;

          console.log(`  ${chalk.cyan(reality.id.slice(0, 8))}  ${reality.name}`);
          console.log(`    ${chalk.dim('Status:')}     ${statusColor(reality.status)}`);
          console.log(`    ${chalk.dim('Dimensions:')} ${reality.dimensions}D`);
          console.log(`    ${chalk.dim('Containers:')} ${reality.containers}`);
          console.log(`    ${chalk.dim('Created:')}    ${new Date(reality.createdAt).toLocaleString()}`);
          console.log();
        }
      }

      console.log(chalk.dim('  Create new: qantum genesis create --name "My Reality"'));
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to list realities'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS COLLAPSE
// ═══════════════════════════════════════════════════════════════════════════════

export async function genesisCollapse(realityId: string, options: CollapseOptions) {
  const config = getConfig();
  // Complexity: O(1)
  requireAuth(config);

  if (options.all) {
    const spinner = ora('Collapsing all realities...').start();

    try {
      const result = await api.delete<{ collapsed: number }>(
        '/api/v1/genesis/collapseAll',
        config
      );

      spinner.succeed(chalk.green(`Collapsed ${result.collapsed} realities`));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to collapse realities'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
    return;
  }

  if (!realityId) {
    console.error(chalk.red('Error: Provide reality ID or use --all'));
    process.exit(1);
  }

  // Confirm unless forced
  if (!options.force) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // SAFETY: async operation — wrap in try-catch for production resilience
    const answer = await new Promise<string>(resolve => {
      rl.question(chalk.yellow(`Collapse reality ${realityId}? [y/N] `), resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y') {
      console.log(chalk.dim('Cancelled'));
      return;
    }
  }

  const spinner = ora('Collapsing reality...').start();

  try {
    await api.delete(`/api/v1/genesis/collapse/${realityId}`, config);
    spinner.succeed(chalk.green('Reality collapsed'));
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to collapse reality'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS STATUS
// ═══════════════════════════════════════════════════════════════════════════════

export async function genesisStatus(options: StatusOptions) {
  const config = getConfig();
  // Complexity: O(N) — loop
  requireAuth(config);

  const spinner = ora('Fetching reality status...').start();

  try {
    const result = await api.get<{
      id: string;
      name: string;
      status: string;
      coherence: number;
      entropy: number;
      dimensions: number;
      containers: Array<{
        name: string;
        status: string;
        health: string;
        ports: string[];
      }>;
      observerCount: number;
      uptime: number;
    }>(`/api/v1/genesis/status/${options.reality}`, config);

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log();
      console.log(chalk.magenta('  🌌 Reality Status'));
      console.log();
      console.log(`  ${chalk.dim('ID:')}          ${chalk.cyan(result.id)}`);
      console.log(`  ${chalk.dim('Name:')}        ${result.name}`);
      
      const statusColor = 
        result.status === 'STABLE' ? chalk.green :
        result.status === 'MANIFESTING' ? chalk.yellow :
        chalk.red;
      console.log(`  ${chalk.dim('Status:')}      ${statusColor(result.status)}`);
      
      console.log(`  ${chalk.dim('Coherence:')}   ${formatProgress(result.coherence)}`);
      console.log(`  ${chalk.dim('Entropy:')}     ${formatProgress(result.entropy, true)}`);
      console.log(`  ${chalk.dim('Dimensions:')} ${result.dimensions}D`);
      console.log(`  ${chalk.dim('Observers:')}   ${result.observerCount}`);
      console.log(`  ${chalk.dim('Uptime:')}      ${formatDuration(result.uptime)}`);
      console.log();
      console.log(chalk.dim('  Containers:'));
      
      for (const container of result.containers) {
        const healthIcon = 
          container.health === 'healthy' ? chalk.green('♥') :
          container.health === 'starting' ? chalk.yellow('◐') :
          chalk.red('✗');
        
        console.log(`    ${healthIcon} ${container.name}`);
        console.log(`      ${chalk.dim('Status:')} ${container.status}`);
        if (container.ports.length > 0) {
          console.log(`      ${chalk.dim('Ports:')}  ${container.ports.join(', ')}`);
        }
      }
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to get reality status'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatProgress(value: number, inverse = false): string {
  const percent = Math.round(value * 100);
  const filled = Math.round(value * 20);
  const empty = 20 - filled;
  
  const color = inverse 
    ? (value > 0.7 ? chalk.red : value > 0.3 ? chalk.yellow : chalk.green)
    : (value > 0.7 ? chalk.green : value > 0.3 ? chalk.yellow : chalk.red);
  
  return color('█'.repeat(filled)) + chalk.dim('░'.repeat(empty)) + ` ${percent}%`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
