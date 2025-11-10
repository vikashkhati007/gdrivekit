# Contributing to gdrivekit 🤝

Thank you for your interest in contributing to **gdrivekit**! We welcome contributions from the community to help make this Google Drive toolkit even better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## 🤔 How Can I Contribute?

There are several ways you can contribute to gdrivekit:

- **Report bugs** - Help us identify and fix issues
- **Suggest enhancements** - Share ideas for new features
- **Improve documentation** - Help others understand the toolkit better
- **Submit pull requests** - Contribute code improvements
- **Write tests** - Improve test coverage
- **Share your use cases** - Help us understand how you're using gdrivekit

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/gdrivekit.git
   cd gdrivekit
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/vikashkhati007/gdrivekit.git
   ```

## 💻 Development Setup

### Prerequisites

- Node.js (v16 or higher) or Bun runtime
- Git
- A text editor or IDE

### Installation

```bash
# Install dependencies
bun install
# or
npm install

# Run tests (if available)
bun test
# or
npm test
```

### Google Cloud Setup

To test Google Drive operations, you'll need:

1. A Google Cloud project
2. OAuth 2.0 credentials
3. Enabled Google Drive API

See the main README for detailed setup instructions.

## 📝 Coding Guidelines

### TypeScript Standards

- Use TypeScript for all new code
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add type definitions for all functions and parameters
- Avoid using `any` type when possible

### Code Style

- Use 2 spaces for indentation
- Use camelCase for variables and functions
- Use PascalCase for types and interfaces
- Add comments for complex logic
- Keep functions small and focused

### Example

```typescript
// Good
interface DriveFileOptions {
  fileName: string;
  mimeType?: string;
  parentId?: string;
}

async function uploadFile(options: DriveFileOptions): Promise<string> {
  // Implementation
}

// Avoid
function upload(a: any, b: any) {
  // Implementation
}
```

## 🔄 Submitting Changes

### 1. Create a Branch

Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation updates
- `refactor/` - for code refactoring
- `test/` - for test additions/changes

### 2. Make Your Changes

- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation if needed
- Add tests for new features

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

Commit message format:
- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation changes
- `style:` - formatting changes
- `refactor:` - code refactoring
- `test:` - adding tests
- `chore:` - maintenance tasks

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template:
   - Describe your changes
   - Reference any related issues
   - Add screenshots (if applicable)
   - Mention any breaking changes

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation for API changes
- Ensure all tests pass
- Respond to review feedback promptly
- Keep your branch up to date with main

## 🐛 Reporting Bugs

Before submitting a bug report:

1. **Check existing issues** - your issue might already be reported
2. **Use the latest version** - ensure you're using the current release
3. **Provide details** - include as much information as possible

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- gdrivekit version: 
- Node.js version: 
- OS: 

**Additional Context**
Any other relevant information.
```

## 💡 Suggesting Enhancements

We love new ideas! When suggesting enhancements:

1. **Check existing issues** - your idea might already be discussed
2. **Be specific** - clearly describe the feature and its benefits
3. **Consider scope** - ensure it aligns with the project goals
4. **Provide examples** - show how the feature would work

### Enhancement Template

```markdown
**Feature Description**
What feature would you like to see?

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How do you envision this working?

**Alternatives Considered**
What other solutions have you thought about?

**Additional Context**
Any other relevant information or examples.
```

## 🧪 Testing

All contributions should include appropriate tests:

- Write unit tests for new functions
- Update existing tests for modified code
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## 📚 Documentation

Good documentation is crucial:

- Update README.md for new features
- Add JSDoc comments to functions
- Include code examples
- Update type definitions

## ❓ Questions?

If you have questions:

- Open a GitHub Discussion
- Check existing issues and PRs
- Review the main README

## 🙏 Thank You!

Your contributions make gdrivekit better for everyone. We appreciate your time and effort!

---

**Happy Contributing!** 🎉
