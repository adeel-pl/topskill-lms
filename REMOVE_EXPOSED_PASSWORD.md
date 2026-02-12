# 🚨 URGENT: Remove Exposed Email Password

## GitGuardian Alert
**Date:** February 4th, 2026, 10:56:07 UTC  
**Type:** Company Email Password  
**Repository:** adeel-pl/topskill-lms

## Immediate Actions

### Step 1: Find the Exposed Password
Run this command to find where the password is:
```bash
cd /home/purelogics-3529/Desktop/topskill-lms
git log --all -p --since="2026-02-04T10:50:00" --until="2026-02-04T11:00:00" | grep -B 10 -A 10 -i "EMAIL_HOST_PASSWORD\|password.*="
```

### Step 2: Rotate the Password
**CRITICAL:** Change the exposed password immediately:
- If Gmail: Generate new App Password at https://myaccount.google.com/apppasswords
- If company email: Change password through email provider
- Update in all environments (local, staging, production)

### Step 3: Remove from Codebase
1. Remove the password from any files
2. Replace with placeholders like `your-app-password` or use environment variables
3. Ensure `.env` files are in `.gitignore` and never committed

### Step 4: Remove from Git History
If the password was committed, it needs to be removed from git history:

```bash
# Option 1: Use git-filter-repo (recommended)
pip install git-filter-repo
git filter-repo --invert-paths --path backend/.env
git filter-repo --replace-text <(echo "OLD_PASSWORD==>NEW_PLACEHOLDER")

# Option 2: Use BFG Repo-Cleaner
# Download from https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 5: Force Push (if history was rewritten)
⚠️ **WARNING:** Only do this if you've removed the password from history
```bash
git push origin --force --all
git push origin --force --tags
```

### Step 6: Verify .gitignore
Ensure these patterns are in `.gitignore`:
```
.env
.env.local
.env*.local
backend/.env*
*.env
```

## Files to Check
Based on the repository structure, check:
- `backend/.env` (if it exists and was committed)
- `EMAIL_CONFIGURATION.md` (should only have placeholders)
- `HOW_TO_GET_RESET_LINK.md` (should only have placeholders)
- Any files modified in commit `4b44f57` (Feb 4, 10:56 UTC)

## Prevention Checklist
- [ ] All `.env` files are in `.gitignore`
- [ ] No actual passwords in documentation (only placeholders)
- [ ] All passwords use environment variables
- [ ] Pre-commit hooks scan for secrets
- [ ] Regular security audits of the repository

## Next Steps After Fix
1. Notify team members to pull latest changes
2. Update all deployment environments with new password
3. Monitor GitGuardian for any new alerts
4. Review all recent commits for other exposed secrets









