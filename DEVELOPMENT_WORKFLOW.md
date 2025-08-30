# Development Workflow Guide

> **Solo Developer Quick Reference** - Your step-by-step guide to proper Git workflow with branch protection

## 🚨 Important Reminder

**The `master` branch is PROTECTED!** You cannot push directly to it. All changes must go through pull requests.

## 📋 Daily Workflow Checklist

### Step 1: Start New Work
```bash
# Always start from master and pull latest changes
git checkout master
git pull origin master

# Create a new feature branch (use descriptive names)
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
# or  
git checkout -b docs/update-readme
```

### Step 2: Work & Commit
```bash
# Make your changes...
# When ready to commit:
git add .
git commit -m "descriptive commit message"

# Push your feature branch
git push origin feature/your-feature-name
```

### Step 3: Create Pull Request
```bash
# Option A: Using GitHub CLI (recommended)
gh pr create --title "Brief description" --body "Detailed description of changes"

# Option B: Go to GitHub.com and create PR manually
```

### Step 4: Wait for Checks & Merge
1. **Wait for CI checks** to pass (typecheck, tests, lint)
2. **Review your own code** in the PR
3. **Merge via GitHub UI** when all checks are green
4. **Clean up** your local branches

### Step 5: Clean Up
```bash
# Switch back to master
git checkout master

# Pull the merged changes
git pull origin master

# Delete the feature branch locally
git branch -d feature/your-feature-name

# Delete the remote feature branch (optional - GitHub can auto-delete)
git push origin --delete feature/your-feature-name
```

## 🔥 Quick Commands Cheat Sheet

### Common Branch Names
```bash
# Features
git checkout -b feature/ideas-sidebar
git checkout -b feature/user-authentication  
git checkout -b feature/search-functionality

# Bug fixes
git checkout -b fix/typescript-errors
git checkout -b fix/missing-validation
git checkout -b fix/ui-layout-issue

# Documentation  
git checkout -b docs/api-documentation
git checkout -b docs/setup-guide
git checkout -b docs/architecture-update

# Refactoring
git checkout -b refactor/service-layer
git checkout -b refactor/component-structure
```

### Emergency: "I Made Changes on Master!"
```bash
# If you accidentally made changes on master:

# 1. Stash your changes
git stash

# 2. Create a feature branch
git checkout -b fix/accidental-master-changes

# 3. Apply your changes
git stash pop

# 4. Commit and push
git add .
git commit -m "fix: move accidental master changes to proper branch"
git push origin fix/accidental-master-changes

# 5. Create PR as normal
gh pr create --title "Fix: Move accidental changes from master"
```

## 🛠️ Troubleshooting Common Issues

### "I Forgot to Branch and Made Changes"
```bash
# Before committing:
git stash                              # Save your changes
git checkout -b feature/my-changes     # Create proper branch
git stash pop                          # Restore changes
git add . && git commit -m "message"   # Commit normally
```

### "My Branch is Behind Master"
```bash
# Update your feature branch with latest master
git checkout master
git pull origin master
git checkout your-feature-branch
git rebase master                      # or git merge master
git push --force-with-lease origin your-feature-branch
```

### "CI Checks are Failing"
```bash
# Run checks locally before pushing
pnpm typecheck     # Fix TypeScript errors
pnpm test          # Fix failing tests  
pnpm check         # Fix linting issues
pnpm check --write # Auto-fix linting where possible
```

### "I Want to Update My PR"
```bash
# Just commit more changes to the same branch
git add .
git commit -m "address review feedback"
git push origin your-feature-branch
# PR automatically updates!
```

## 📊 Repository Status Commands

```bash
# Check current status
git status

# See all branches
git branch -a

# See what's different from master
git diff master

# See commit history
git log --oneline -10

# Check if master protection is active
gh api repos/smanaton/pulse/branches/master/protection
```

## 🎯 Solo Developer Tips

### 1. **Use Descriptive Branch Names**
- ✅ `feature/ideas-search-functionality`
- ✅ `fix/typescript-import-errors`
- ❌ `temp`
- ❌ `test`
- ❌ `wip`

### 2. **Small, Focused Changes**
- One feature/fix per branch
- Easier to review and debug
- Faster CI checks

### 3. **Self-Review Your PRs**
- Read through your changes in the GitHub UI
- Check for console.logs, debugging code, typos
- Ensure tests are included

### 4. **Use Draft PRs for Work in Progress**
```bash
gh pr create --draft --title "[WIP] Feature in progress"
# Convert to ready when done:
gh pr ready
```

### 5. **Set Up Aliases for Common Commands**
```bash
# Add to your .gitconfig or shell profile:
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.cm commit
```

## ⚠️ What NOT to Do

- ❌ `git push origin master` (will be rejected)
- ❌ `git commit -am "fix"` (use descriptive messages)
- ❌ Working directly on master branch
- ❌ Force pushing to shared branches
- ❌ Committing without testing

## ✅ What TO Do

- ✅ Always branch for new work
- ✅ Write descriptive commit messages
- ✅ Run tests before pushing
- ✅ Review your own PRs
- ✅ Keep branches focused and small
- ✅ Clean up merged branches

## 🆘 Emergency Contacts

- **GitHub Issues**: https://github.com/smanaton/pulse/issues
- **Repository**: https://github.com/smanaton/pulse
- **Branch Protection**: https://github.com/smanaton/pulse/settings/branches

---

## 💡 Remember: Branch Protection is Your Friend!

It prevents you from accidentally breaking the main branch and ensures all code goes through proper quality checks. Even as a solo developer, this maintains professional standards and prevents "oops" moments.

**When in doubt, create a branch!** 🌿