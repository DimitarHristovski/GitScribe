/**
 * Badge Generator
 * Generates repository badges based on quality score and documentation status
 */

import { RepoQualityReport, GeneratedDocs } from '../types/core';
import { SimpleRepo } from './github-service';

/**
 * Generate markdown badges for a repository
 */
export function generateBadges(
  repo: SimpleRepo,
  quality?: RepoQualityReport,
  docs?: GeneratedDocs
): string {
  const badges: string[] = [];

  // Quality Score Badge
  if (quality) {
    const score = quality.overallScore;
    const color = getQualityColor(score);
    badges.push(
      `![Quality Score](https://img.shields.io/badge/quality-${score}%2F100-${color}?style=for-the-badge)`
    );
  }

  // Documentation Status Badge
  if (docs && docs.sections.length > 0) {
    badges.push(
      `![Documentation](https://img.shields.io/badge/docs-generated-success?style=for-the-badge&logo=readthedocs)`
    );
  } else {
    badges.push(
      `![Documentation](https://img.shields.io/badge/docs-pending-yellow?style=for-the-badge&logo=readthedocs)`
    );
  }

  // Language Badge
  if (repo.language) {
    const langColor = getLanguageColor(repo.language);
    badges.push(
      `![Language](https://img.shields.io/badge/language-${encodeURIComponent(repo.language)}-${langColor}?style=for-the-badge&logo=${getLanguageLogo(repo.language)})`
    );
  }

  // License Badge (if we can detect it)
  badges.push(
    `![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)`
  );

  // Repository Status
  if (repo.private) {
    badges.push(
      `![Status](https://img.shields.io/badge/status-private-red?style=for-the-badge)`
    );
  } else {
    badges.push(
      `![Status](https://img.shields.io/badge/status-public-green?style=for-the-badge)`
    );
  }

  // Last Updated
  if (repo.lastPushedAt) {
    const date = new Date(repo.lastPushedAt);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    const activityColor = daysAgo < 30 ? 'green' : daysAgo < 90 ? 'yellow' : 'red';
    badges.push(
      `![Last Updated](https://img.shields.io/badge/updated-${daysAgo}%20days%20ago-${activityColor}?style=for-the-badge)`
    );
  }

  return badges.join(' ');
}

/**
 * Get color based on quality score
 */
function getQualityColor(score: number): string {
  if (score >= 80) return 'brightgreen';
  if (score >= 60) return 'green';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
}

/**
 * Get color for programming language
 */
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: 'F7DF1E',
    TypeScript: '3178C6',
    Python: '3776AB',
    Java: 'ED8B00',
    'C++': '00599C',
    Go: '00ADD8',
    Rust: '000000',
    Ruby: 'CC342D',
    PHP: '777BB4',
    Swift: 'FA7343',
    Kotlin: '7F52FF',
    Dart: '0175C2',
    HTML: 'E34F26',
    CSS: '1572B6',
    Shell: '89E051',
  };

  return colors[language] || 'gray';
}

/**
 * Get logo for programming language
 */
function getLanguageLogo(language: string): string {
  const logos: Record<string, string> = {
    JavaScript: 'javascript',
    TypeScript: 'typescript',
    Python: 'python',
    Java: 'java',
    'C++': 'cplusplus',
    Go: 'go',
    Rust: 'rust',
    Ruby: 'ruby',
    PHP: 'php',
    Swift: 'swift',
    Kotlin: 'kotlin',
    Dart: 'dart',
    HTML: 'html5',
    CSS: 'css3',
    Shell: 'gnu-bash',
  };

  return logos[language] || 'code';
}

/**
 * Generate a complete badges section markdown
 */
export function generateBadgesMarkdown(
  repo: SimpleRepo,
  quality?: RepoQualityReport,
  docs?: GeneratedDocs
): string {
  const badges = generateBadges(repo, quality, docs);
  return `## Badges\n\n${badges}\n\n`;
}

