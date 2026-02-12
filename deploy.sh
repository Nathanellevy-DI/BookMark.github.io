#!/bin/bash
set -e

# ============================================================
# BookMarked — One-Shot Deploy to GitHub Pages
# ============================================================
# This script will:
#   1. Initialize a Git repo (if not already)
#   2. Install dependencies (including gh-pages)
#   3. Link the remote repository
#   4. Push source code to the main branch
#   5. Build the app and deploy to gh-pages branch
# ============================================================

REPO_URL="https://github.com/Nathanellevy-DI/BookMark.github.io.git"
BRANCH="main"

echo ""
echo "🔖 BookMarked — Deployment Script"
echo "=================================="
echo ""

# --- Step 1: Git Init ---
if [ ! -d ".git" ]; then
  echo "📁 Initializing Git repository..."
  git init -b "$BRANCH"
else
  echo "✅ Git already initialized."
fi

# --- Step 2: Install Dependencies ---
echo ""
echo "📦 Installing dependencies (including gh-pages)..."
npm install

# --- Step 3: Link Remote ---
if git remote get-url origin &>/dev/null; then
  echo ""
  echo "🔗 Remote 'origin' already set. Updating..."
  git remote set-url origin "$REPO_URL"
else
  echo ""
  echo "🔗 Adding remote origin..."
  git remote add origin "$REPO_URL"
fi

# --- Step 4: Push Source to Main ---
echo ""
echo "📝 Staging all files..."
git add -A

echo "💾 Committing..."
git commit -m "feat: initial BookMarked PWA" --allow-empty

echo ""
echo "🚀 Pushing source code to $BRANCH..."
git push -u origin "$BRANCH" --force

# --- Step 5: Build & Deploy to gh-pages ---
echo ""
echo "🏗️  Building production bundle..."
npm run build

echo ""
echo "🌐 Deploying to gh-pages branch..."
npx gh-pages -d dist

echo ""
echo "============================================================"
echo "✅ Deployment complete!"
echo ""
echo "📱 Your app will be live at:"
echo "   https://Nathanellevy-DI.github.io/BookMark.github.io/"
echo ""
echo "⏳ It may take 1-2 minutes for GitHub Pages to go live."
echo "   Go to: Repository → Settings → Pages to verify."
echo ""
echo "📲 To install as PWA on iPhone/iPad:"
echo "   Open in Safari → Share → Add to Home Screen"
echo "============================================================"
