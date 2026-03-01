# Publishing to VS Code Marketplace

## Prerequisites

1. **Azure DevOps Account**: Create one at https://dev.azure.com
2. **Personal Access Token (PAT)**: Required for publishing

## Step 1: Create a Publisher

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your Microsoft account
3. Click "Create publisher"
4. Fill in:
   - **Publisher ID**: e.g., `your-username` (this goes in package.json)
   - **Publisher Name**: Your display name

## Step 2: Create a Personal Access Token (PAT)

1. Go to https://dev.azure.com
2. Click on your profile icon → "Personal access tokens"
3. Click "New Token"
4. Configure:
   - **Name**: `vsce-publish`
   - **Organization**: Select "All accessible organizations"
   - **Scopes**: Select "Custom defined" then:
     - Check "Marketplace" → "Manage"
5. Click "Create" and **copy the token** (you won't see it again!)

## Step 3: Update package.json

Update the `publisher` field in `package.json` with your Publisher ID:

```json
{
  "publisher": "your-publisher-id"
}
```

## Step 4: Add a License

Create a `LICENSE` file:

```bash
# MIT License example
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

## Step 5: Add Repository Info (Optional but Recommended)

Add to `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/cucumber-scenario-runner.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/cucumber-scenario-runner/issues"
  },
  "homepage": "https://github.com/your-username/cucumber-scenario-runner#readme"
}
```

## Step 6: Login to vsce

```bash
npx vsce login your-publisher-id
```

Enter your Personal Access Token when prompted.

## Step 7: Publish

```bash
# Publish the extension
npx vsce publish

# Or publish with a specific version bump
npx vsce publish minor  # 1.0.0 → 1.1.0
npx vsce publish patch  # 1.0.0 → 1.0.1
```

## Quick Publish Commands

```bash
# Package only (creates .vsix file)
npm run package

# Login and publish
npx vsce login your-publisher-id
npx vsce publish
```

## After Publishing

1. View your extension: https://marketplace.visualstudio.com/items?itemName=your-publisher-id.cucumber-scenario-runner
2. It takes a few minutes for the extension to appear in search results
3. Users can install it directly from VS Code Extensions panel

## Updating the Extension

1. Update version in `package.json`
2. Update CHANGELOG/README if needed
3. Run `npx vsce publish`

## Troubleshooting

### "Missing publisher name"
- Make sure `publisher` in package.json matches your Publisher ID exactly

### "Personal access token verification failed"
- Ensure your PAT has "Marketplace: Manage" scope
- Make sure you selected "All accessible organizations"
- Check the PAT hasn't expired

### "Extension not found in search"
- Wait 5-10 minutes after publishing
- Make sure the extension is not set to "unpublished" in the management portal