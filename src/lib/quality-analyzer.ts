/**
 * Repository Quality Analyzer
 * Analyzes repository structure and generates quality metrics (0-100 score)
 */

import { SimpleRepo } from './github-service';
import { RepoQualityReport, RepoQualityMetric } from '../types/core';
import { listGitHubContents, getGitHubToken } from './github-service';
import { callLangChainJSON } from './langchain-service';

/**
 * Analyze repository quality and generate a quality report
 */
export async function analyzeRepoQuality(
  repo: SimpleRepo,
  repoAnalysis?: any
): Promise<RepoQualityReport> {
  console.log(`[QualityAnalyzer] Analyzing quality for ${repo.fullName}...`);

  const token = getGitHubToken();
  const metrics: RepoQualityMetric[] = [];

  try {
    // 1. README Quality (weight: 0.15)
    const readmeScore = await analyzeReadmeQuality(repo, token);
    metrics.push({
      id: 'readme',
      label: 'README Quality',
      score: readmeScore,
      weight: 0.15,
      description: 'Presence and quality of README documentation',
    });

    // 2. Code Organization (weight: 0.20)
    const orgScore = await analyzeCodeOrganization(repo, token);
    metrics.push({
      id: 'organization',
      label: 'Code Organization',
      score: orgScore,
      weight: 0.20,
      description: 'Folder structure and file organization',
    });

    // 3. Testing Coverage (weight: 0.15)
    const testScore = await analyzeTesting(repo, token);
    metrics.push({
      id: 'testing',
      label: 'Testing',
      score: testScore,
      weight: 0.15,
      description: 'Test files and CI/CD setup',
    });

    // 4. Documentation (weight: 0.15)
    const docsScore = await analyzeDocumentation(repo, token);
    metrics.push({
      id: 'documentation',
      label: 'Documentation',
      score: docsScore,
      weight: 0.15,
      description: 'Overall documentation coverage',
    });

    // 5. Configuration Files (weight: 0.10)
    const configScore = await analyzeConfiguration(repo, token);
    metrics.push({
      id: 'configuration',
      label: 'Configuration',
      score: configScore,
      weight: 0.10,
      description: 'Presence of essential config files',
    });

    // 6. License & Legal (weight: 0.10)
    const licenseScore = await analyzeLicense(repo, token);
    metrics.push({
      id: 'license',
      label: 'License & Legal',
      score: licenseScore,
      weight: 0.10,
      description: 'License file and legal compliance',
    });

    // 7. Code Quality Indicators (weight: 0.15)
    const codeQualityScore = await analyzeCodeQuality(repo, token, repoAnalysis);
    metrics.push({
      id: 'code-quality',
      label: 'Code Quality',
      score: codeQualityScore,
      weight: 0.15,
      description: 'Code structure and best practices',
    });

    // Calculate weighted overall score
    const overallScore = Math.round(
      metrics.reduce((sum, metric) => sum + metric.score * metric.weight, 0)
    );

    return {
      repoName: repo.fullName,
      overallScore: Math.min(100, Math.max(0, overallScore)),
      metrics,
    };
  } catch (error: any) {
    console.error(`[QualityAnalyzer] Error analyzing ${repo.fullName}:`, error);
    // Return default metrics on error
    return {
      repoName: repo.fullName,
      overallScore: 0,
      metrics: [
        {
          id: 'error',
          label: 'Analysis Error',
          score: 0,
          weight: 1.0,
          description: error.message || 'Failed to analyze repository',
        },
      ],
    };
  }
}

/**
 * Analyze README quality (0-100)
 */
async function analyzeReadmeQuality(repo: SimpleRepo, token: string | null): Promise<number> {
  try {
    const contents = await listGitHubContents(repo.owner, repo.name, '', repo.defaultBranch, token);
    const readmeFile = contents.find(
      (f) => f.name.toLowerCase().startsWith('readme') && f.type === 'file'
    );

    if (!readmeFile) return 0;

    // Check README size (larger = better, up to a point)
    const size = readmeFile.size || 0;
    let score = 20; // Base score for having README

    if (size > 500) score += 20; // Has content
    if (size > 2000) score += 20; // Substantial content
    if (size > 5000) score += 20; // Comprehensive
    if (size > 10000) score += 20; // Very detailed

    return Math.min(100, score);
  } catch {
    return 0;
  }
}

/**
 * Analyze code organization (0-100)
 */
async function analyzeCodeOrganization(repo: SimpleRepo, token: string | null): Promise<number> {
  try {
    const contents = await listGitHubContents(repo.owner, repo.name, '', repo.defaultBranch, token);
    const folders = contents.filter((f) => f.type === 'dir');
    const files = contents.filter((f) => f.type === 'file');

    let score = 0;

    // Check for common organized folder structures
    const hasSrc = folders.some((f) => f.name.toLowerCase() === 'src');
    const hasLib = folders.some((f) => f.name.toLowerCase() === 'lib' || f.name.toLowerCase() === 'libs');
    const hasTests = folders.some((f) => f.name.toLowerCase().includes('test'));
    const hasDocs = folders.some((f) => f.name.toLowerCase().includes('doc'));

    if (hasSrc) score += 25;
    if (hasLib) score += 15;
    if (hasTests) score += 20;
    if (hasDocs) score += 15;

    // Check if root is not cluttered (not too many files)
    if (files.length < 10) score += 15;
    else if (files.length < 20) score += 10;

    // Check for config files in root (good practice)
    const hasConfig = files.some((f) =>
      f.name.match(/^(package\.json|tsconfig\.json|\.gitignore|\.eslintrc|\.prettierrc)/i)
    );
    if (hasConfig) score += 10;

    return Math.min(100, score);
  } catch {
    return 50; // Default moderate score
  }
}

/**
 * Analyze testing setup (0-100)
 */
async function analyzeTesting(repo: SimpleRepo, token: string | null): Promise<number> {
  try {
    const contents = await listGitHubContents(repo.owner, repo.name, '', repo.defaultBranch, token);
    const allFiles: string[] = [];

    // Recursively check for test files (simplified - just check common locations)
    const checkForTests = async (path: string = '') => {
      const items = await listGitHubContents(repo.owner, repo.name, path, repo.defaultBranch, token);
      for (const item of items) {
        if (item.type === 'file') {
          allFiles.push(item.path);
        } else if (item.type === 'dir' && (item.name.includes('test') || item.name.includes('spec'))) {
          allFiles.push(item.path);
        }
      }
    };

    await checkForTests();
    await checkForTests('tests');
    await checkForTests('test');
    await checkForTests('__tests__');
    await checkForTests('spec');

    let score = 0;

    // Check for test files
    const testFiles = allFiles.filter((f) =>
      f.match(/(test|spec)\.(js|ts|jsx|tsx|py|java|go|rs)$/i)
    );
    if (testFiles.length > 0) score += 40;

    // Check for CI/CD files
    const hasCI = contents.some((f) =>
      f.name.match(/^(\.github\/workflows|\.gitlab-ci|\.travis|\.circleci|Jenkinsfile)/i)
    );
    if (hasCI) score += 30;

    // Check for test config
    const hasTestConfig = contents.some((f) =>
      f.name.match(/(jest|mocha|pytest|junit|vitest)\.config/i)
    );
    if (hasTestConfig) score += 30;

    return Math.min(100, score);
  } catch {
    return 0;
  }
}

/**
 * Analyze documentation coverage (0-100)
 */
async function analyzeDocumentation(repo: SimpleRepo, token: string | null): Promise<number> {
  try {
    const contents = await listGitHubContents(repo.owner, repo.name, '', repo.defaultBranch, token);
    let score = 0;

    // README
    const hasReadme = contents.some((f) => f.name.toLowerCase().startsWith('readme'));
    if (hasReadme) score += 30;

    // Docs folder
    const hasDocsFolder = contents.some((f) => f.type === 'dir' && f.name.toLowerCase().includes('doc'));
    if (hasDocsFolder) score += 25;

    // Contributing, License, Changelog
    const hasContributing = contents.some((f) => f.name.toLowerCase().startsWith('contributing'));
    const hasLicense = contents.some((f) => f.name.toLowerCase().startsWith('license'));
    const hasChangelog = contents.some((f) => f.name.toLowerCase().startsWith('changelog'));

    if (hasContributing) score += 15;
    if (hasLicense) score += 15;
    if (hasChangelog) score += 15;

    return Math.min(100, score);
  } catch {
    return 0;
  }
}

/**
 * Analyze configuration files (0-100)
 */
async function analyzeConfiguration(repo: SimpleRepo, token: string | null): Promise<number> {
  try {
    const contents = await listGitHubContents(repo.owner, repo.name, '', repo.defaultBranch, token);
    const files = contents.filter((f) => f.type === 'file').map((f) => f.name.toLowerCase());
    let score = 0;

    // Essential config files
    const configs = [
      { pattern: /^\.gitignore$/, points: 20 },
      { pattern: /^(package\.json|requirements\.txt|pom\.xml|build\.gradle|cargo\.toml)$/, points: 20 },
      { pattern: /^(tsconfig|jsconfig|webpack|vite|rollup)\./, points: 15 },
      { pattern: /^(\.eslintrc|\.prettierrc|\.editorconfig)$/, points: 15 },
      { pattern: /^(dockerfile|docker-compose|\.dockerignore)$/i, points: 10 },
      { pattern: /^(\.env\.example|\.env\.template)$/, points: 10 },
      { pattern: /^(\.github\/workflows\/)/, points: 10 },
    ];

    for (const config of configs) {
      if (files.some((f) => config.pattern.test(f))) {
        score += config.points;
      }
    }

    return Math.min(100, score);
  } catch {
    return 50;
  }
}

/**
 * Analyze license and legal compliance (0-100)
 */
async function analyzeLicense(repo: SimpleRepo, token: string | null): Promise<number> {
  try {
    const contents = await listGitHubContents(repo.owner, repo.name, '', repo.defaultBranch, token);
    const hasLicense = contents.some((f) => f.name.toLowerCase().startsWith('license'));
    return hasLicense ? 100 : 0;
  } catch {
    return 0;
  }
}

/**
 * Analyze code quality indicators (0-100)
 */
async function analyzeCodeQuality(
  repo: SimpleRepo,
  token: string | null,
  repoAnalysis?: any
): Promise<number> {
  try {
    let score = 50; // Base score

    // Use repoAnalysis if available
    if (repoAnalysis) {
      // Check for complexity indicators
      if (repoAnalysis.complexity === 'simple') score += 20;
      else if (repoAnalysis.complexity === 'moderate') score += 10;

      // Check for tech stack indicators
      if (repoAnalysis.techStack && repoAnalysis.techStack.length > 0) score += 15;

      // Check for key features
      if (repoAnalysis.keyFeatures && repoAnalysis.keyFeatures.length > 3) score += 15;
    }

    // Check for TypeScript (indicates type safety)
    const contents = await listGitHubContents(repo.owner, repo.name, '', repo.defaultBranch, token);
    const hasTypeScript = contents.some((f) =>
      f.name.match(/(tsconfig|\.ts$|\.tsx$)/i)
    );
    if (hasTypeScript) score += 20;

    return Math.min(100, score);
  } catch {
    return 50;
  }
}

