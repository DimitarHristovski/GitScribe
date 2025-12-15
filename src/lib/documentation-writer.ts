/**
 * Documentation Writer Service
 * Generates documentation for pages, components, and sections from GitHub repositories
 */

import { fetchGitHubFile, parseGitHubUrl, getGitHubToken, listGitHubContents, listAllFiles } from './github-service';
import { Project, Page, Section } from '../types';
import { callLangChain } from './langchain-service';

export interface DocumentationOptions {
  format?: 'markdown' | 'html' | 'json';
  includeCode?: boolean;
  includeProps?: boolean;
  includeExamples?: boolean;
  depth?: 'basic' | 'detailed' | 'comprehensive';
}

/**
 * Generate documentation for a page - simple text description
 */
export async function generatePageDocumentation(
  page: Page,
  project: Project,
  options: DocumentationOptions = {}
): Promise<string> {
  const sections = page.sections?.sort((a, b) => a.order - b.order) || [];
  
  let doc = '';
  
  // Generate a simple text description of what this page is about
  doc = `${page.title}\n\n`;
  
  // Describe the page based on its sections and content
  const sectionDescriptions: string[] = [];
  
  sections.forEach((section) => {
    let description = '';
    const sectionType = section.type.toLowerCase();
    const props = section.props || {};
    
    switch (sectionType) {
      case 'hero':
        if (props.title) {
          description = `A hero section featuring "${props.title}"`;
          if (props.subtitle) {
            description += ` with the message "${props.subtitle}"`;
    }
        } else {
          description = 'A hero section';
        }
        break;
      
      case 'features':
        if (props.title) {
          description = `A features section titled "${props.title}"`;
          if (props.items && Array.isArray(props.items)) {
            description += ` highlighting ${props.items.length} key feature${props.items.length !== 1 ? 's' : ''}`;
          }
        } else {
          description = 'A features section';
        }
        break;
      
      case 'pricing':
        if (props.title) {
          description = `A pricing section titled "${props.title}"`;
          if (props.tiers && Array.isArray(props.tiers)) {
            description += ` with ${props.tiers.length} pricing tier${props.tiers.length !== 1 ? 's' : ''}`;
          }
        } else {
          description = 'A pricing section';
        }
        break;
      
      case 'testimonials':
        if (props.title) {
          description = `A testimonials section titled "${props.title}"`;
          if (props.items && Array.isArray(props.items)) {
            description += ` featuring ${props.items.length} testimonial${props.items.length !== 1 ? 's' : ''}`;
          }
        } else {
          description = 'A testimonials section';
      }
        break;
      
      case 'faq':
        if (props.title) {
          description = `An FAQ section titled "${props.title}"`;
          if (props.items && Array.isArray(props.items)) {
            description += ` with ${props.items.length} question${props.items.length !== 1 ? 's' : ''} and answer${props.items.length !== 1 ? 's' : ''}`;
      }
        } else {
          description = 'An FAQ section';
        }
        break;
      
      case 'gallery':
        if (props.title) {
          description = `A gallery section titled "${props.title}"`;
          if (props.items && Array.isArray(props.items)) {
            description += ` showcasing ${props.items.length} item${props.items.length !== 1 ? 's' : ''}`;
          }
        } else {
          description = 'A gallery section';
        }
        break;
      
      case 'contact':
        if (props.title) {
          description = `A contact section titled "${props.title}"`;
          if (props.email || props.phone || props.address) {
            const contactMethods = [];
            if (props.email) contactMethods.push('email');
            if (props.phone) contactMethods.push('phone');
            if (props.address) contactMethods.push('address');
            description += ` with contact information (${contactMethods.join(', ')})`;
          }
        } else {
          description = 'A contact section';
        }
        break;
      
      case 'about':
        if (props.title) {
          description = `An about section titled "${props.title}"`;
          if (props.content) {
            description += ' with detailed content';
          }
        } else {
          description = 'An about section';
        }
        break;
      
      case 'cta':
        if (props.title) {
          description = `A call-to-action section titled "${props.title}"`;
          if (props.ctaLabel) {
            description += ` with a "${props.ctaLabel}" button`;
          }
        } else {
          description = 'A call-to-action section';
        }
        break;
      
      case 'footer':
        if (props.companyName) {
          description = `A footer section for ${props.companyName}`;
          if (props.links && Array.isArray(props.links)) {
            description += ` with ${props.links.length} link${props.links.length !== 1 ? 's' : ''}`;
          }
        } else {
          description = 'A footer section';
        }
        break;
      
      case 'navbar':
        description = 'A navigation bar';
        break;
      
      default:
        description = `A ${section.type} section`;
    }
    
    sectionDescriptions.push(description);
  });
  
  // Build the page description
  if (sectionDescriptions.length === 0) {
    doc += `This is the ${page.title} page located at ${page.path}. The page is part of the ${project.name} project.\n\n`;
    doc += `Currently, this page does not have any sections configured.`;
  } else {
    doc += `This is the ${page.title} page located at ${page.path}. The page is part of the ${project.name} project.\n\n`;
    doc += `This page contains the following content:\n\n`;
    
    sectionDescriptions.forEach((desc, index) => {
      doc += `${index + 1}. ${desc}.\n`;
    });
    
    doc += `\nTogether, these sections create a ${page.title.toLowerCase()} page that `;
    
    // Generate a summary based on page title and sections
    const pageType = page.title.toLowerCase();
    if (pageType.includes('home') || page.path === '/') {
      doc += `serves as the main landing page for the website, introducing visitors to ${project.name} and providing key information and navigation options.`;
    } else if (pageType.includes('about')) {
      doc += `provides information about ${project.name}, including background details and key information about the organization or service.`;
    } else if (pageType.includes('contact')) {
      doc += `allows visitors to get in touch with ${project.name} through various contact methods.`;
    } else if (pageType.includes('pricing') || pageType.includes('plan')) {
      doc += `displays pricing information and options for ${project.name}'s products or services.`;
    } else if (pageType.includes('service')) {
      doc += `showcases the services or offerings provided by ${project.name}.`;
    } else if (pageType.includes('portfolio') || pageType.includes('gallery') || pageType.includes('work')) {
      doc += `displays a collection of work, projects, or visual content for ${project.name}.`;
    } else if (pageType.includes('blog') || pageType.includes('article')) {
      doc += `features blog posts, articles, or news content related to ${project.name}.`;
    } else {
      doc += `provides relevant information and content related to ${page.title.toLowerCase()} for ${project.name}.`;
    }
  }
  
  return doc;
}

/**
 * Generate documentation for a section - simple text description
 */
export function generateSectionDocumentation(
  section: Section,
  options: DocumentationOptions = {}
): string {
  let doc = '';
  const props = section.props || {};
  const sectionType = section.type.toLowerCase();
  
  // Generate a simple text description
  let description = '';
  
  switch (sectionType) {
    case 'hero':
      if (props.title) {
        description = `This hero section displays "${props.title}"`;
        if (props.subtitle) {
          description += ` with the subtitle "${props.subtitle}"`;
        }
      } else {
        description = 'This is a hero section';
      }
      break;
    
    case 'features':
      if (props.title) {
        description = `This features section is titled "${props.title}"`;
        if (props.items && Array.isArray(props.items)) {
          description += ` and highlights ${props.items.length} key feature${props.items.length !== 1 ? 's' : ''}`;
        }
      } else {
        description = 'This is a features section';
      }
      break;
    
    case 'pricing':
      if (props.title) {
        description = `This pricing section is titled "${props.title}"`;
        if (props.tiers && Array.isArray(props.tiers)) {
          description += ` and presents ${props.tiers.length} pricing option${props.tiers.length !== 1 ? 's' : ''}`;
        }
      } else {
        description = 'This is a pricing section';
      }
      break;
    
    case 'testimonials':
      if (props.title) {
        description = `This testimonials section is titled "${props.title}"`;
        if (props.items && Array.isArray(props.items)) {
          description += ` and displays ${props.items.length} customer testimonial${props.items.length !== 1 ? 's' : ''}`;
        }
      } else {
        description = 'This is a testimonials section';
      }
      break;
    
    case 'faq':
      if (props.title) {
        description = `This FAQ section is titled "${props.title}"`;
        if (props.items && Array.isArray(props.items)) {
          description += ` and answers ${props.items.length} frequently asked question${props.items.length !== 1 ? 's' : ''}`;
        }
      } else {
        description = 'This is an FAQ section';
      }
      break;
    
    case 'gallery':
      if (props.title) {
        description = `This gallery section is titled "${props.title}"`;
        if (props.items && Array.isArray(props.items)) {
          description += ` and showcases ${props.items.length} visual item${props.items.length !== 1 ? 's' : ''}`;
        }
      } else {
        description = 'This is a gallery section';
      }
      break;
    
    case 'contact':
      if (props.title) {
        description = `This contact section is titled "${props.title}"`;
        if (props.email || props.phone || props.address) {
          const contactMethods = [];
          if (props.email) contactMethods.push('email');
          if (props.phone) contactMethods.push('phone');
          if (props.address) contactMethods.push('address');
          description += ` and provides contact information including ${contactMethods.join(', ')}`;
        }
      } else {
        description = 'This is a contact section';
      }
      break;
    
    case 'about':
      if (props.title) {
        description = `This about section is titled "${props.title}"`;
        if (props.content) {
          description += ' and includes detailed information about the organization or service';
        }
          } else {
        description = 'This is an about section';
      }
      break;
    
    case 'cta':
      if (props.title) {
        description = `This call-to-action section is titled "${props.title}"`;
        if (props.ctaLabel) {
          description += ` and features a "${props.ctaLabel}" button to encourage user action`;
        }
      } else {
        description = 'This is a call-to-action section';
      }
      break;
    
    case 'footer':
      if (props.companyName) {
        description = `This footer section displays information for ${props.companyName}`;
        if (props.links && Array.isArray(props.links)) {
          description += ` and includes ${props.links.length} navigation link${props.links.length !== 1 ? 's' : ''}`;
          }
      } else {
        description = 'This is a footer section';
      }
      break;
    
    case 'navbar':
      description = 'This navigation bar provides links to different pages and sections of the website';
      break;
    
    default:
      description = `This is a ${section.type} section that displays relevant content for the page`;
    }
  
  doc = `${description}.`;
  
  return doc;
}

/**
 * Generate documentation for an entire project - simple text description
 */
export async function generateProjectDocumentation(
  project: Project,
  options: DocumentationOptions = {}
): Promise<string> {
  const pages = project.pages || [];
  let doc = '';
  
  // Generate a simple text description
  doc = `${project.name}\n\n`;
  
  if (project.description) {
    doc += `${project.description}\n\n`;
  }
  
  doc += `This project contains ${pages.length} page${pages.length !== 1 ? 's' : ''}:\n\n`;
  
  // Generate documentation for each page
  for (const page of pages.sort((a, b) => a.order - b.order)) {
    const pageDoc = await generatePageDocumentation(page, project, options);
    doc += `${pageDoc}\n\n`;
  }
  
  return doc.trim();
}

/**
 * Generate a comprehensive explanation of what the site does
 */
async function generateSiteExplanation(
  repo: string,
  owner: string,
  readme: string | null,
  packageJson: any,
  projectData: any,
  pages: Page[] | null
): Promise<string> {
  // Collect information about the site
  const siteInfo: string[] = [];
  
  if (readme) {
    // Extract first few paragraphs from README
    const readmeLines = readme.split('\n').filter(line => line.trim().length > 0);
    const firstParagraphs = readmeLines.slice(0, 5).join(' ');
    if (firstParagraphs.length > 0) {
      siteInfo.push(`Project Description: ${firstParagraphs.substring(0, 500)}`);
    }
  }
  
  if (packageJson) {
    if (packageJson.description) {
      siteInfo.push(`Package Description: ${packageJson.description}`);
    }
    if (packageJson.name) {
      siteInfo.push(`Project Name: ${packageJson.name}`);
    }
    if (packageJson.scripts) {
      const scripts = Object.keys(packageJson.scripts).join(', ');
      siteInfo.push(`Available Scripts: ${scripts}`);
    }
  }
  
  if (projectData && projectData.pages) {
    const pageTitles = projectData.pages.map((p: any) => p.title).join(', ');
    siteInfo.push(`Pages: ${pageTitles}`);
    
    // Analyze sections to understand functionality
    const allSections: string[] = [];
    projectData.pages.forEach((page: any) => {
      if (page.sections && Array.isArray(page.sections)) {
        page.sections.forEach((section: any) => {
          if (section.type) {
            allSections.push(section.type);
          }
        });
      }
    });
    
    if (allSections.length > 0) {
      const uniqueSections = [...new Set(allSections)];
      siteInfo.push(`Site Features: ${uniqueSections.join(', ')} sections`);
    }
  }
  
  // Try to use AI to generate explanation if OpenAI is available
  try {
    const systemPrompt = `You are a technical documentation expert. Analyze the provided information about a website or web application and write a clear, comprehensive explanation of what the site does, its purpose, and its main features. Write in a professional but accessible tone.`;
    
    const userPrompt = `Based on the following information about the website "${repo}" (${owner}/${repo}), write a comprehensive explanation of what this site does:

${siteInfo.join('\n\n')}

Please provide:
1. A clear explanation of the site's purpose and what it does
2. The main features and functionality
3. Who the target audience might be
4. What users can accomplish with this site

Write 2-4 paragraphs that clearly explain what this site does.`;
    
    const aiExplanation = await callLangChain(userPrompt, systemPrompt, 'gpt-4o-mini', 0.7);
    return aiExplanation;
  } catch (error) {
    // Fallback to rule-based explanation if AI is not available
    return generateFallbackExplanation(repo, owner, siteInfo, pages);
  }
}

/**
 * Generate a fallback explanation when AI is not available
 */
function generateFallbackExplanation(
  repo: string,
  owner: string,
  siteInfo: string[],
  pages: Page[] | null
): string {
  let explanation = `## What This Site Does\n\n`;
  
  explanation += `The **${repo}** website is a web application developed by ${owner}. `;
  
  // Analyze pages to understand the site's purpose
  if (pages && pages.length > 0) {
    const pageTypes = pages.map(p => p.title.toLowerCase());
    
    if (pageTypes.some(t => t.includes('home') || t.includes('landing'))) {
      explanation += `This site serves as a digital presence with a landing page that introduces visitors to the project. `;
    }
    
    if (pageTypes.some(t => t.includes('about'))) {
      explanation += `It includes an About page that provides information about the organization or project. `;
    }
    
    if (pageTypes.some(t => t.includes('contact'))) {
      explanation += `Visitors can get in touch through a dedicated Contact page. `;
    }
    
    if (pageTypes.some(t => t.includes('service') || t.includes('feature'))) {
      explanation += `The site showcases services or features offered by the project. `;
    }
    
    if (pageTypes.some(t => t.includes('product') || t.includes('shop') || t.includes('store'))) {
      explanation += `It includes e-commerce functionality with product listings and shopping capabilities. `;
    }
    
    if (pageTypes.some(t => t.includes('blog') || t.includes('article'))) {
      explanation += `The site features a blog or article section for content publishing. `;
    }
    
    if (pageTypes.some(t => t.includes('portfolio') || t.includes('gallery'))) {
      explanation += `It displays a portfolio or gallery showcasing work, projects, or visual content. `;
    }
    
    if (pageTypes.some(t => t.includes('pricing') || t.includes('plan'))) {
      explanation += `Pricing information and plans are available for users to review. `;
    }
    
    if (pageTypes.some(t => t.includes('dashboard'))) {
      explanation += `The site includes a dashboard with analytics, data visualization, and user management features. `;
    }
    
    explanation += `\n\n`;
    explanation += `**Main Pages:** The site consists of ${pages.length} main page${pages.length !== 1 ? 's' : ''}: ${pages.map(p => p.title).join(', ')}. `;
    explanation += `Each page serves a specific purpose in providing information and functionality to visitors.`;
  } else {
    explanation += `Based on the repository structure, this appears to be a web application with various features and functionality. `;
    explanation += `The site likely provides information, services, or tools related to the project's purpose.`;
  }
  
  if (siteInfo.length > 0) {
    explanation += `\n\n**Technical Details:** `;
    const techInfo = siteInfo.filter(info => !info.includes('Pages:') && !info.includes('Site Features:'));
    if (techInfo.length > 0) {
      explanation += techInfo.join('. ') + '.';
    }
  }
  
  return explanation;
}

/**
 * Generate documentation from GitHub repository - reads files and creates comprehensive site documentation
 */
export async function generateDocumentationFromGitHub(
  githubUrl: string,
  options: DocumentationOptions = {}
): Promise<string> {
  const repoInfo = parseGitHubUrl(githubUrl);
  if (!repoInfo) {
    throw new Error('Invalid GitHub URL. Please use format: https://github.com/owner/repo or owner/repo');
  }
  
  const { owner, repo, branch = 'main' } = repoInfo;
  const token = getGitHubToken();
  
  let documentation = '';
  
  documentation = `# Documentation for ${owner}/${repo}\n\n`;
  documentation += `**Repository:** ${owner}/${repo}  \n`;
  documentation += `**Branch:** ${branch}  \n`;
  documentation += `**Generated:** ${new Date().toISOString()}\n\n`;
  documentation += `---\n\n`;
  
  // Try to fetch README first
  let readme = null;
  try {
    readme = await fetchGitHubFile(owner, repo, 'README.md', branch, token || undefined);
  } catch (e) {
    // README not found, continue
  }
  
  if (readme) {
    documentation += `## Project Overview\n\n`;
    documentation += `${readme}\n\n`;
    documentation += `---\n\n`;
  }
  
  // Try to fetch package.json to understand the project structure
  let packageJson = null;
  try {
    const packageContent = await fetchGitHubFile(owner, repo, 'package.json', branch, token || undefined);
    if (packageContent) {
      packageJson = JSON.parse(packageContent);
      documentation += `## Project Configuration\n\n`;
      documentation += `**Name:** ${packageJson.name || repo}\n\n`;
      if (packageJson.description) {
        documentation += `**Description:** ${packageJson.description}\n\n`;
      }
      if (packageJson.version) {
        documentation += `**Version:** ${packageJson.version}\n\n`;
      }
      if (packageJson.scripts) {
        documentation += `**Available Scripts:**\n\n`;
        Object.entries(packageJson.scripts).forEach(([script, command]) => {
          documentation += `- \`${script}\`: ${command}\n`;
        });
        documentation += `\n`;
      }
      if (packageJson.dependencies) {
        const depCount = Object.keys(packageJson.dependencies).length;
        documentation += `**Dependencies:** ${depCount} packages\n\n`;
      }
      documentation += `---\n\n`;
    }
  } catch (e) {
    // package.json not found, continue
  }
  
  // Try to fetch project.json first (for generated pages)
  const projectFiles = [
    'project.json',
    'export/project.json',
    'src/project.json',
  ];
  
  let projectData = null;
  for (const file of projectFiles) {
    try {
      const content = await fetchGitHubFile(owner, repo, file, branch, token || undefined);
      if (content) {
        try {
          projectData = JSON.parse(content);
          break;
        } catch (e) {
          // Not JSON, continue
        }
      }
    } catch (e) {
      // Continue to next file
    }
  }
  
  // Generate "What This Site Does" explanation
  let siteExplanation = '';
  let project: Project | null = null;
  let pages: Page[] | null = null;
  
  if (projectData) {
    // Convert projectData to Project format
    project = {
      id: '',
      user_id: '',
      name: projectData.name || repo,
      description: projectData.description || '',
      theme: projectData.theme || {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1f2937',
        fontFamily: 'Inter, sans-serif',
      },
      pages: projectData.pages?.map((p: any) => ({
        id: p.id || '',
        project_id: '',
        path: p.path,
        title: p.title,
        order: p.order || 0,
        sections: p.sections || [],
      })) || [],
    };
    pages = project.pages || [];
  }
  
  // Generate comprehensive site explanation
  try {
    siteExplanation = await generateSiteExplanation(repo, owner, readme, packageJson, projectData, pages);
    documentation += `## What This Site Does\n\n`;
    documentation += `${siteExplanation}\n\n`;
    documentation += `---\n\n`;
  } catch (error: any) {
    console.warn('Could not generate AI explanation:', error.message);
    // Continue without AI explanation
  }
  
  if (projectData) {
    documentation += `## Site Structure\n\n`;
    documentation += `This project contains ${projectData.pages?.length || 0} page${projectData.pages?.length !== 1 ? 's' : ''}:\n\n`;
    
    // Generate documentation for each page
    for (const page of project!.pages!.sort((a, b) => a.order - b.order)) {
      const pageDoc = await generatePageDocumentation(page, project!, options);
      documentation += `${pageDoc}\n\n`;
    }
  } else {
    // Analyze repository structure to find pages and components
    documentation += `## Site Structure Analysis\n\n`;
    
    try {
      // List files in common directories
      const commonDirs = ['app', 'pages', 'src/pages', 'src/app', 'components', 'src/components'];
      const foundPages: string[] = [];
      const foundComponents: string[] = [];
      
      for (const dir of commonDirs) {
        try {
          const contents = await listGitHubContents(owner, repo, dir, branch, token || undefined);
          for (const item of contents) {
            if (item.type === 'file' && (item.name.endsWith('.tsx') || item.name.endsWith('.jsx') || item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
              if (dir.includes('page') || item.name.includes('page') || item.path.includes('/page')) {
                foundPages.push(item.path);
              } else if (dir.includes('component')) {
                foundComponents.push(item.path);
              }
            } else if (item.type === 'dir') {
              // Recursively check subdirectories
              try {
                const subContents = await listGitHubContents(owner, repo, item.path, branch, token || undefined);
                for (const subItem of subContents) {
                  if (subItem.type === 'file' && (subItem.name.endsWith('.tsx') || subItem.name.endsWith('.jsx'))) {
                    if (subItem.path.includes('page') || subItem.name === 'page.tsx' || subItem.name === 'page.jsx') {
                      foundPages.push(subItem.path);
                    } else {
                      foundComponents.push(subItem.path);
                    }
                  }
                }
              } catch (e) {
                // Skip subdirectory
              }
            }
          }
        } catch (e) {
          // Directory doesn't exist, continue
        }
      }
      
      if (foundPages.length > 0) {
        documentation += `### Pages Found (${foundPages.length})\n\n`;
        foundPages.forEach((pagePath) => {
          documentation += `- **${pagePath}**\n`;
        });
        documentation += `\n`;
      }
      
      if (foundComponents.length > 0) {
        documentation += `### Components Found (${foundComponents.length})\n\n`;
        // Group by directory
        const componentMap: Record<string, string[]> = {};
        foundComponents.forEach((compPath) => {
          const dir = compPath.split('/').slice(0, -1).join('/') || 'root';
          if (!componentMap[dir]) {
            componentMap[dir] = [];
          }
          componentMap[dir].push(compPath.split('/').pop() || compPath);
        });
        
        Object.entries(componentMap).forEach(([dir, components]) => {
          documentation += `**${dir || 'root'}:**\n`;
          components.forEach((comp) => {
            documentation += `- ${comp}\n`;
          });
          documentation += `\n`;
        });
      }
      
      // Try to read key files for more information
      const keyFiles = [
        'next.config.js',
        'next.config.ts',
        'tailwind.config.js',
        'tailwind.config.ts',
        'tsconfig.json',
      ];
      
      documentation += `### Configuration Files\n\n`;
      for (const file of keyFiles) {
        try {
          const content = await fetchGitHubFile(owner, repo, file, branch, token || undefined);
          if (content) {
            documentation += `**${file}** - Found and analyzed\n\n`;
          }
        } catch (e) {
          // File not found
        }
      }
      
    } catch (error: any) {
      documentation += `Unable to analyze repository structure: ${error.message}\n\n`;
      documentation += `This may be due to:\n`;
      documentation += `- Repository is private (requires GitHub token)\n`;
      documentation += `- Rate limiting (try again later or use a GitHub token)\n`;
      documentation += `- Invalid repository URL\n\n`;
    }
  }
  
  // Add file structure summary
  try {
    const rootContents = await listGitHubContents(owner, repo, '', branch, token || undefined);
    if (rootContents.length > 0) {
      documentation += `## Repository Structure\n\n`;
      documentation += `**Root Directory Contents:**\n\n`;
      rootContents.slice(0, 20).forEach((item) => {
        const icon = item.type === 'dir' ? '📁' : '📄';
        documentation += `${icon} ${item.name}\n`;
      });
      if (rootContents.length > 20) {
        documentation += `\n... and ${rootContents.length - 20} more items\n`;
      }
      documentation += `\n`;
    }
  } catch (e) {
    // Could not list root contents
  }
  
  return documentation;
}

/**
 * Generate documentation from a hosted page URL
 * Re-exported from url-importer for convenience
 */
export { generateDocumentationFromUrl } from './url-importer';

/**
 * Export documentation to file
 */
export function exportDocumentation(
  documentation: string,
  filename: string = 'documentation.md'
): void {
  const blob = new Blob([documentation], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

