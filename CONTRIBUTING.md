# Contributing to Pharma DMS

Thank you for considering contributing to the Pharma Document Management System! This document provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Focus on what is best for the project and community
- Show empathy towards other community members
- Accept constructive criticism gracefully

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Python version, database)
- **Error logs** (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why this enhancement would be useful
- **Possible implementation** approach (if you have one)
- **Alternatives considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding standards** described below
3. **Add tests** for new functionality
4. **Update documentation** for any changed functionality
5. **Ensure all tests pass**
6. **Update the CHANGELOG** (if applicable)
7. **Submit pull request** with clear description

#### Pull Request Process

1. Update the README.md or relevant documentation with details of changes
2. Add any new environment variables to `.env.example`
3. Update the API documentation if endpoints change
4. Ensure code follows the project's style guidelines
5. Verify all tests pass locally
6. Request review from maintainers

## Development Guidelines

### Code Style

This project follows Python best practices:

- **PEP 8** for Python code style
- **Black** for code formatting (line length: 100)
- **Type hints** for function arguments and return values
- **Docstrings** for all public functions, classes, and modules

### Formatting Code

```bash
# Format with Black
black backend/app --line-length 100

# Check with flake8
flake8 backend/app --max-line-length 100

# Type checking with mypy
mypy backend/app
```

### Project Structure

Follow the existing project structure:

```
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── core/          # Core utilities (security, RBAC, audit)
│   ├── models/        # Database models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic (if needed)
│   └── utils/         # Helper functions
├── alembic/           # Database migrations
├── scripts/           # Utility scripts
└── tests/             # Test files
```

### Database Changes

1. **Create migration** after model changes:
   ```bash
   alembic revision --autogenerate -m "Description"
   ```

2. **Review migration** before committing

3. **Test migration** up and down:
   ```bash
   alembic upgrade head
   alembic downgrade -1
   alembic upgrade head
   ```

### Testing

- Write tests for all new features
- Maintain existing test coverage
- Test edge cases and error conditions
- Use meaningful test names

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest tests/test_auth.py -v
```

### Documentation

- Update API documentation for endpoint changes
- Add docstrings to new functions and classes
- Update README.md for significant changes
- Update user stories if requirements change

### Security Considerations

This is a pharmaceutical document management system subject to regulations (FDA 21 CFR Part 11). All contributions must:

1. **Maintain audit trail integrity**
   - Never delete audit logs
   - Never modify past audit records
   - Always log significant actions

2. **Preserve security features**
   - Don't weaken password requirements
   - Don't bypass authentication/authorization
   - Don't expose sensitive data in logs/errors

3. **Follow validation requirements**
   - Input validation on all endpoints
   - SQL injection prevention
   - XSS prevention
   - CSRF protection

4. **Data integrity**
   - Database constraints
   - Transaction management
   - Rollback support

### Commit Messages

Write clear, meaningful commit messages:

```
feat: Add email notification for document approval
fix: Resolve issue with user role assignment
docs: Update API documentation for user endpoints
test: Add tests for audit log filtering
refactor: Simplify password validation logic
```

Use conventional commits format:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or changes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

Example:
```bash
git checkout -b feature/document-versioning
git checkout -b bugfix/login-error-message
```

### Version Numbering

Follow Semantic Versioning (SemVer):
- MAJOR.MINOR.PATCH (e.g., 1.2.3)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

## Compliance Considerations

When contributing to this pharmaceutical DMS:

### FDA 21 CFR Part 11 Requirements

1. **Electronic Records**
   - Ensure data integrity
   - Maintain audit trails
   - Support validation

2. **Electronic Signatures**
   - Verify identity
   - Record signature metadata
   - Ensure non-repudiation

3. **System Access**
   - Role-based access control
   - User authentication
   - Session management

4. **Audit Trail**
   - Who, what, when, where
   - Immutable records
   - Searchable logs

### Good Documentation Practices (GDP)

- Version control for documents
- Change control procedures
- Review and approval workflows
- Training records

## Review Process

1. **Automated checks** run on all PRs:
   - Linting (flake8)
   - Formatting (black)
   - Tests (pytest)
   - Type checking (mypy)

2. **Code review** by maintainers:
   - Code quality
   - Test coverage
   - Documentation
   - Security implications
   - Compliance considerations

3. **Testing**:
   - Run in development environment
   - Verify functionality
   - Check for regressions

## Getting Help

- Review existing documentation
- Check existing issues and PRs
- Ask questions in issue comments
- Contact maintainers

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor list

Thank you for contributing to Pharma DMS! Your efforts help create a better system for pharmaceutical document management and regulatory compliance.

