#!/usr/bin/env node

/**
 * Simple performance benchmarking script
 * This is a basic implementation until we build the full benchmarking infrastructure
 */

import { writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Calculate total size of a directory recursively
 */
function getDirSize(dirPath) {
  let totalSize = 0;

  try {
    const files = readdirSync(dirPath);

    for (const file of files) {
      const filePath = join(dirPath, file);
      const stats = statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getDirSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }

  return totalSize;
}

/**
 * Get build artifacts information
 */
function analyzeBuild() {
  const distPath = join(rootDir, 'dist');

  try {
    const totalSize = getDirSize(distPath);
    const files = readdirSync(distPath);

    const fileAnalysis = files
      .map((file) => {
        const filePath = join(distPath, file);
        const stats = statSync(filePath);

        if (stats.isFile()) {
          return {
            name: file,
            size: stats.size,
            type: file.split('.').pop(),
          };
        }
        return null;
      })
      .filter(Boolean);

    return {
      totalSize,
      fileCount: fileAnalysis.length,
      files: fileAnalysis,
      jsFiles: fileAnalysis.filter((f) => f.type === 'js'),
      cssFiles: fileAnalysis.filter((f) => f.type === 'css'),
      htmlFiles: fileAnalysis.filter((f) => f.type === 'html'),
    };
  } catch (error) {
    console.error('Error analyzing build:', error.message);
    return null;
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main benchmarking function
 */
function runBenchmark() {
  console.log('🔍 Running performance benchmark...\n');

  const buildAnalysis = analyzeBuild();

  if (!buildAnalysis) {
    console.error('❌ Could not analyze build. Make sure to run `pnpm build` first.');
    process.exit(1);
  }

  const results = {
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'local',
    branch: process.env.GITHUB_REF_NAME || 'local',
    bundleSize: buildAnalysis.totalSize,
    analysis: {
      totalFiles: buildAnalysis.fileCount,
      jsFiles: buildAnalysis.jsFiles.length,
      cssFiles: buildAnalysis.cssFiles.length,
      htmlFiles: buildAnalysis.htmlFiles.length,
      largestJsFile: buildAnalysis.jsFiles.reduce(
        (largest, file) => (file.size > (largest?.size || 0) ? file : largest),
        null
      ),
      largestCssFile: buildAnalysis.cssFiles.reduce(
        (largest, file) => (file.size > (largest?.size || 0) ? file : largest),
        null
      ),
    },
  };

  // Output results
  console.log('📊 Performance Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Bundle Size: ${formatBytes(results.bundleSize)}`);
  console.log(`Total Files: ${results.analysis.totalFiles}`);
  console.log(`JavaScript Files: ${results.analysis.jsFiles}`);
  console.log(`CSS Files: ${results.analysis.cssFiles}`);
  console.log(`HTML Files: ${results.analysis.htmlFiles}`);

  if (results.analysis.largestJsFile) {
    console.log(
      `Largest JS File: ${results.analysis.largestJsFile.name} (${formatBytes(results.analysis.largestJsFile.size)})`
    );
  }

  if (results.analysis.largestCssFile) {
    console.log(
      `Largest CSS File: ${results.analysis.largestCssFile.name} (${formatBytes(results.analysis.largestCssFile.size)})`
    );
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Save results to file
  const resultsPath = join(rootDir, 'performance-results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`✅ Results saved to ${resultsPath}`);

  return results;
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmark();
}

export { runBenchmark, analyzeBuild, formatBytes };
