# Debugging: Documentation Not Generated

If documentation isn't being generated when you click "Run Workflow", follow these steps:

## 1. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab. Look for:

### Expected Logs
You should see logs like:
```
[Manager] Starting agent workflow...
[RepoDiscovery] Starting repository discovery...
[RepoAnalysis] Starting repository analysis...
[QualityAnalyzer] Starting quality analysis...
[RefactorProposal] Starting refactor proposal generation...
[DocsPlanner] Starting documentation planning...
[DocsWriter] Starting documentation generation...
```

### Error Indicators
- `[Manager] Step X was skipped!` - A step didn't run
- `[DocsWriter] No documentation plans available` - Planning step failed
- `[DocsWriter] WARNING: No documentation was generated` - Generation failed
- Any red error messages

## 2. Check Workflow Steps Status

In the UI, check which steps show as:
- ✅ **Completed** (green checkmark)
- ⏳ **Running** (spinning loader)
- ❌ **Error** (red X)
- ⚪ **Pending** (gray circle)

**If WRITING step shows as completed but no docs appear:**
- Check console for `[DocsWriter] Completed generation for X repositories`
- If X is 0, generation failed silently

## 3. Verify Prerequisites

### OpenAI API Key
- Go to Settings
- Ensure OpenAI API Key is configured
- Test by generating documentation - if it fails, the key might be invalid

### GitHub Token
- Go to Settings  
- Ensure GitHub Token is configured
- Required for repository access

### Repository Selection
- Ensure at least one repository is selected
- Repository must be accessible with your GitHub token

### Format & Section Selection
- Ensure at least one output format is selected (e.g., markdown)
- Ensure at least one section type is selected (e.g., README)

## 4. Check Workflow State

After workflow completes, check the browser console for:
```javascript
[Manager] State after step: {
  completedSteps: [...],
  hasDiscoveredRepos: true/false,
  hasRepoAnalyses: true/false,
  hasDocumentationPlans: true/false,
  hasGeneratedDocs: true/false
}
```

**Common Issues:**
- `hasDiscoveredRepos: false` → DISCOVERY failed
- `hasRepoAnalyses: false` → ANALYSIS failed  
- `hasDocumentationPlans: false` → PLANNING failed
- `hasGeneratedDocs: false` → WRITING failed

## 5. Check Specific Step Failures

### DISCOVERY Step
**Symptoms:** Workflow stops immediately
**Check:**
- Are repositories selected?
- Do repositories have `fullName`, `owner`, `name` fields?
- Is GitHub token valid?

### ANALYSIS Step
**Symptoms:** DISCOVERY completes but ANALYSIS doesn't start
**Check:**
- Are `discoveredRepos` set?
- Check console for `[RepoAnalysis]` logs
- Repository might be inaccessible

### PLANNING Step
**Symptoms:** ANALYSIS completes but PLANNING doesn't start
**Check:**
- Are `repoAnalyses` set?
- OpenAI API key might be invalid
- Check for `[DocsPlanner]` error logs

### WRITING Step
**Symptoms:** PLANNING completes but no documentation appears
**Check:**
- Are `documentationPlans` set?
- OpenAI API key might be invalid or rate-limited
- Check for `[DocsWriter]` error logs
- Check if `generatedDocs` map is empty

## 6. Common Error Messages

### "No documentation plans available"
**Cause:** PLANNING step didn't create plans
**Fix:** 
- Check if PLANNING step completed
- Check OpenAI API key
- Check console for PLANNING errors

### "No valid repositories found"
**Cause:** DISCOVERY couldn't validate repositories
**Fix:**
- Ensure repositories are properly selected
- Check repository structure

### "GitHub token required"
**Cause:** GitHub token not configured
**Fix:**
- Go to Settings and add GitHub token

### "OpenAI API key required"
**Cause:** OpenAI key not configured
**Fix:**
- Go to Settings and add OpenAI API key

## 7. Debugging Steps

1. **Open Browser Console** (F12)
2. **Clear Console** (to see fresh logs)
3. **Click "Run Workflow"**
4. **Watch the logs** - note which step fails
5. **Check the workflow UI** - see which step shows error
6. **Look for error messages** in red

## 8. Manual State Check

After workflow completes, in browser console, type:
```javascript
// Check if workflow state is available
// (This requires the workflow modal to be open)
```

Or check the Network tab for API calls:
- GitHub API calls (should succeed)
- OpenAI API calls (should succeed)

## 9. Recent Fixes Applied

The following improvements were made:
- ✅ Better error handling in DocsWriter
- ✅ Fallback to baseMarkdown if section generation fails
- ✅ Better logging to identify where generation fails
- ✅ State validation before step transitions
- ✅ RepoDiscovery always marks completion

## 10. Still Not Working?

If documentation still isn't generated:

1. **Check all console errors** - copy and save them
2. **Verify all prerequisites** (tokens, keys, repos)
3. **Try with a single, simple repository** first
4. **Check Network tab** for failed API requests
5. **Verify OpenAI API key** has credits/quota

## Quick Checklist

- [ ] Browser console open (F12)
- [ ] OpenAI API key configured
- [ ] GitHub token configured  
- [ ] At least one repository selected
- [ ] At least one format selected
- [ ] At least one section type selected
- [ ] All workflow steps complete (check UI)
- [ ] No red errors in console
- [ ] `generatedDocs` map has entries (check console logs)

## Getting Help

If you're still stuck, provide:
1. Console logs (especially `[DocsWriter]` and `[Manager]` logs)
2. Which step shows as error in UI
3. Error messages from console
4. Your configuration (formats, sections selected)
5. Number of repositories selected

