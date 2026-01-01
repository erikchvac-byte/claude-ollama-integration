# How to Push to GitHub

Follow these steps to publish your repository to GitHub as **erikchvac-byte/claude-ollama-integration**

---

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. **Repository name**: `claude-ollama-integration`
3. **Description**: Self-improving task routing between local Ollama models and Claude API
4. **Visibility**:
   - ✅ **Public** (recommended - share with others)
   - ⬜ Private (only you can see it)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

---

## Step 2: Connect Your Local Repository

After creating the repository, GitHub will show you commands. Use these:

### Option A: Using HTTPS (Easiest)

```bash
cd /c/Users/erikc/Dev/claude-ollama-integration

# Add GitHub as remote
git remote add origin https://github.com/erikchvac-byte/claude-ollama-integration.git

# Push your code
git branch -M main
git push -u origin main
```

### Option B: Using SSH (If you have SSH keys set up)

```bash
cd /c/Users/erikc/Dev/claude-ollama-integration

# Add GitHub as remote
git remote add origin git@github.com:erikchvac-byte/claude-ollama-integration.git

# Push your code
git branch -M main
git push -u origin main
```

---

## Step 3: Enter Your Credentials

When you run `git push`, Git will ask for:
- **Username**: `erikchvac-byte`
- **Password**: Use a **Personal Access Token** (not your GitHub password)

### How to Create a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: `claude-ollama-integration-push`
4. Select scopes:
   - ✅ **repo** (all sub-items)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when git asks

---

## Step 4: Verify It Worked

After pushing, check:
1. Go to: https://github.com/erikchvac-byte/claude-ollama-integration
2. You should see all your files!
3. The README.md will display automatically

---

## Quick Command Summary

```bash
# Navigate to repo
cd /c/Users/erikc/Dev/claude-ollama-integration

# Add GitHub remote
git remote add origin https://github.com/erikchvac-byte/claude-ollama-integration.git

# Rename branch to main (GitHub's default)
git branch -M main

# Push everything
git push -u origin main
```

---

## Troubleshooting

### "remote origin already exists"
```bash
git remote remove origin
# Then try adding it again
git remote add origin https://github.com/erikchvac-byte/claude-ollama-integration.git
```

### "Authentication failed"
- Make sure you're using a **Personal Access Token**, not your password
- Generate a new token at: https://github.com/settings/tokens

### "Repository not found"
- Make sure you created the repository on GitHub first
- Check the repository name is exactly: `claude-ollama-integration`

---

## After Successful Push

Your repository will be at:
**https://github.com/erikchvac-byte/claude-ollama-integration**

You can:
- Share the link with others
- Add topics/tags for discoverability
- Enable GitHub Pages for documentation
- Add a license (MIT is recommended)
- Star your own repo!

---

## Future Updates

After the initial push, updating is simple:

```bash
cd /c/Users/erikc/Dev/claude-ollama-integration

# Make changes, then commit
git add .
git commit -m "Your update message"

# Push to GitHub
git push
```

That's it! Your Personal Access Token will be cached, so you won't need to enter it every time.
