# GitHub Actions Workflows

This directory contains automated workflows for building, testing, and releasing the React Context DevTool extension.

## 🔄 Workflows Overview

### 1. **Build and Package Extension** (`build.yml`)
**Triggers:** Push to main/master/develop, Pull Requests, Releases

**What it does:**
- Builds extension for both Chrome and Firefox
- Tests on multiple Node.js versions (18.x, 20.x)
- Creates zip packages for distribution
- Uploads build artifacts
- Automatically attaches packages to GitHub releases

**Artifacts:**
- `react-context-devtool-chrome-nodeX.X` - Chrome extension build
- `react-context-devtool-firefox-nodeX.X` - Firefox extension build
- `react-context-devtool-chrome-package-nodeX.X` - Chrome zip package
- `react-context-devtool-firefox-package-nodeX.X` - Firefox zip package

### 2. **Development Build** (`dev-build.yml`)
**Triggers:** Push to develop/feature/fix branches, Pull Requests

**What it does:**
- Runs ESLint for code quality
- Builds development version
- Validates standalone connection files
- Tests webpack configuration
- Comments on PRs with build status

**Special Features:**
- Validates new standalone connection functionality
- Provides PR feedback with build results
- Shorter artifact retention (14 days)

### 3. **Release Extension** (`release.yml`)
**Triggers:** Git tags (v*), Manual workflow dispatch

**What it does:**
- Creates GitHub releases with detailed changelog
- Builds production-ready packages
- Uploads release assets (Chrome/Firefox zips)
- Creates standalone example package
- Generates store update reminders

**Release Assets:**
- `ReactContextDevtool_chrome.zip` - Chrome Web Store package
- `ReactContextDevtool_firefox.zip` - Firefox Add-ons package
- `react-context-devtool-standalone-example.tar.gz` - Standalone server example

### 4. **Test Standalone Connection** (`test-standalone.yml`)
**Triggers:** Changes to standalone connection files, Manual dispatch

**What it does:**
- Tests standalone WebSocket server startup
- Validates WebSocket protocol implementation
- Verifies extension build includes standalone features
- Runs integration tests between extension and server

**Test Coverage:**
- WebSocket connection establishment
- Message protocol validation
- Server startup and response
- Extension-server communication

## 🚀 Usage

### For Developers

**Local Development:**
```bash
# Install dependencies
npm ci

# Build development version
npm run build:dev

# Start development server
npm run start:dev:chrome  # or :firefox

# Run linting
npm run lint

# Test standalone server
npm run standalone:example
```

**Testing Standalone Connection:**
```bash
# Start standalone server
cd example/standalone
npm install
npm start

# In another terminal, test connection
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8097');
ws.on('open', () => console.log('Connected!'));
"
```

### For Releases

**Creating a Release:**
1. Update version in `package.json` and manifests
2. Create and push a git tag:
   ```bash
   git tag v4.5.0
   git push origin v4.5.0
   ```
3. GitHub Actions will automatically:
   - Build packages
   - Create GitHub release
   - Upload assets
   - Create store update reminder

**Manual Release:**
1. Go to Actions → Release Extension
2. Click "Run workflow"
3. Enter version and options
4. GitHub Actions handles the rest

### For Store Updates

After a release is created:
1. Download zip files from GitHub release
2. Upload to respective browser stores:
   - **Chrome:** [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - **Firefox:** [Developer Hub](https://addons.mozilla.org/developers/)
   - **Edge:** [Partner Center](https://partner.microsoft.com/dashboard)

## 📦 Artifacts and Retention

| Artifact Type | Retention | Purpose |
|---------------|-----------|---------|
| Development builds | 14 days | Testing and validation |
| PR builds | 7 days | Pull request review |
| Release packages | 365 days | Long-term distribution |
| Test artifacts | 7 days | Debugging test failures |

## 🔧 Configuration

### Environment Variables
- `GITHUB_TOKEN` - Automatically provided by GitHub
- `NODE_ENV` - Set by workflows (development/production)

### Secrets Required
- `GITHUB_TOKEN` - For creating releases and comments (auto-provided)

### Matrix Strategy
- **Node.js versions:** 18.x, 20.x
- **Browsers:** Chrome, Firefox
- **Build types:** Development, Production

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**
1. Check Node.js version compatibility
2. Verify all dependencies are installed
3. Check for ESLint errors
4. Validate webpack configuration

**Standalone Connection Tests Failing:**
1. Ensure WebSocket server starts correctly
2. Check port availability (8097)
3. Verify message protocol implementation
4. Test WebSocket connection manually

**Release Issues:**
1. Verify tag format (v*.*.*)
2. Check package.json version matches tag
3. Ensure all required files are present
4. Validate manifest versions

### Debug Commands

```bash
# Test build locally
npm run test:build

# Validate standalone server
cd example/standalone && npm start

# Check webpack config
npx webpack --config build/webpack.config.js --mode development --stats=verbose

# Test WebSocket connection
node -e "const ws = require('ws'); new ws('ws://localhost:8097');"
```

## 📋 Workflow Status

You can monitor workflow status at:
- **Actions tab:** https://github.com/[username]/react-context-devtool/actions
- **Releases:** https://github.com/[username]/react-context-devtool/releases
- **Artifacts:** Available in completed workflow runs

## 🔄 Continuous Integration

The workflows ensure:
- ✅ Code quality through ESLint
- ✅ Build compatibility across Node.js versions
- ✅ Extension functionality for both browsers
- ✅ Standalone connection features work correctly
- ✅ Automated release process
- ✅ Store-ready packages are generated

## 📞 Support

If you encounter issues with the workflows:
1. Check the Actions tab for detailed logs
2. Review this documentation
3. Open an issue with workflow logs attached
4. Tag maintainers for urgent build issues