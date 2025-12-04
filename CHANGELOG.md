# Changelog

All notable changes to the Pharma DMS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### 🎉 Phase 1 Complete: User Management and RBAC

Initial release with complete user management and role-based access control system.

### Added

#### Authentication
- JWT-based authentication system
- Secure login endpoint with username and password
- Token-based session management
- User profile endpoint
- Logout endpoint (for audit purposes)
- Password hashing with bcrypt
- Token expiration handling

#### User Management (Admin Only)
- Create user endpoint with role assignment
- List users with pagination and filtering
  - Filter by role name
  - Filter by active/inactive status
  - Search by username, email, or name
- Get user details by ID
- Update user information and roles
- Activate user account
- Deactivate user account
- Admin password reset with force-change option
- Delete user (with warning about deactivation alternative)

#### Role-Based Access Control (RBAC)
- Four predefined roles:
  - Author: Document creation and editing
  - Reviewer: Document review and commenting
  - Approver: Document approval with e-signature
  - DMS_Admin: Full system administration
- Permission-based access control system
- Role validation middleware
- Multiple roles per user support
- Extensible permission framework

#### Audit Logging
- Comprehensive audit trail for all actions
- Logged events:
  - USER_CREATED
  - USER_UPDATED
  - USER_ACTIVATED
  - USER_DEACTIVATED
  - USER_DELETED
  - PASSWORD_RESET
  - USER_LOGIN
  - LOGIN_FAILED
- Audit log endpoints with filtering
  - Filter by action type
  - Filter by entity type
  - Filter by user ID
  - Filter by username
  - Filter by date range
- Searchable and filterable logs
- Immutable audit records
- IP address and user agent tracking

#### Database
- SQLAlchemy ORM models
  - User model with authentication fields
  - Role model with descriptions
  - User-Role many-to-many relationship
  - AuditLog model with full context
- Alembic database migrations
- Initial schema migration
- Database initialization script
- Database reset script
- PostgreSQL support (recommended)
- SQLite support (development)

#### Security Features
- Password strength validation
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit
- Bcrypt password hashing with automatic salting
- JWT token generation and validation
- Admin-only password reset (no self-service)
- Force password change on reset
- Secure password storage (no plain text)
- CORS configuration
- Input validation with Pydantic

#### API Documentation
- OpenAPI/Swagger documentation
- Interactive API testing UI at `/api/docs`
- ReDoc documentation at `/api/redoc`
- Complete endpoint descriptions
- Request/response examples
- Authentication flow documentation

#### Development Tools
- Docker and Docker Compose setup
- Multi-stage Dockerfile for backend
- PostgreSQL container
- pgAdmin container for database management
- Health check endpoints
- Environment-based configuration
- Development and production modes
- Auto-reload in development

#### Documentation
- Comprehensive README.md
- Quick start guide (QUICKSTART.md)
- Detailed setup instructions (docs/SETUP.md)
- Complete API documentation (docs/API.md)
- User stories with implementation status (docs/USER_STORIES.md)
- Contributing guidelines (CONTRIBUTING.md)
- Project summary (PROJECT_SUMMARY.md)
- MIT License

#### Scripts and Utilities
- Quick start scripts (start.sh, start.bat)
- Database initialization script
- Database reset script
- Python run script
- Environment configuration template

### User Stories Completed

All 20 user stories for Phase 1 have been implemented:

- ✅ URS-1: System shall allow Admin to create user accounts (2 stories)
- ✅ URS-2: System shall allow Admin to view a list of all users (2 stories)
- ✅ URS-3: System shall allow Admin to edit/update user details (2 stories)
- ✅ URS-4: System shall allow Admin to deactivate/activate user accounts (2 stories)
- ✅ URS-5: System shall allow Users to log in securely (2 stories)
- ✅ URS-6: System shall enforce Role-Based Access Control (2 stories)
- ✅ URS-7: System shall hash & securely store user passwords (2 stories)
- ✅ URS-8: System shall allow only Admin to reset user passwords (3 stories)
- ✅ URS-9: System shall maintain an audit log for user-related actions (2 stories)
- ✅ URS-10: System shall provide user profile details (2 stories)

### Technical Specifications

- **Language**: Python 3.11+
- **Framework**: FastAPI 0.109.0
- **ORM**: SQLAlchemy 2.0.25
- **Database**: PostgreSQL 15 (SQLite for dev)
- **Migrations**: Alembic 1.13.1
- **Authentication**: JWT (python-jose 3.3.0)
- **Password Hashing**: Bcrypt (passlib 1.7.4)
- **Validation**: Pydantic 2.5.3
- **Server**: Uvicorn 0.27.0
- **Container**: Docker with Docker Compose

### Compliance

- FDA 21 CFR Part 11 ready architecture
  - Complete audit trail
  - User authentication and authorization
  - Electronic signature foundation
  - Data integrity controls
  - Validation-ready structure
- EU Annex 11 considerations
  - Risk-based approach
  - Personnel controls
  - Data integrity
  - Audit trail

### Security

- Bcrypt password hashing
- JWT token authentication
- Role-based access control
- Input validation
- SQL injection prevention
- XSS prevention
- CORS configuration
- Secure password policy enforcement
- Admin-only sensitive operations
- IP and user agent tracking

### Performance

- Async/await support with FastAPI
- Connection pooling
- Efficient database queries
- Pagination for large datasets
- Index optimization

---

## [Unreleased]

### Planned for Phase 2: Document Management

- Document creation and editing
- Document versioning system
- Document metadata management
- File upload and storage
- Document templates
- Document categories
- Document search

### Planned for Phase 3: Workflow Management

- Document lifecycle state machine
  - Draft → Under Review → Pending Approval → Published → Archived
- Review workflow
- Approval workflow with e-signature
- Electronic signature capture
- Signature verification
- Notifications and alerts
- Email integration
- Workflow history

### Planned for Phase 4: Advanced Features

- Full-text document search
- Advanced reporting and analytics
- Document archival policies
- Compliance reporting
- Training record tracking
- External system integration APIs
- Mobile-responsive frontend
- Real-time collaboration features

---

## Version History

### [1.0.0] - 2024-01-15
- Initial release
- Phase 1: User Management and RBAC complete
- Production-ready user authentication and authorization
- Complete audit logging system
- Docker deployment ready

---

## Migration Guide

### From 0.x to 1.0.0

This is the initial release. No migration needed.

---

## Contributors

- Initial development and architecture
- User management implementation
- RBAC system design
- Audit logging implementation
- Documentation and testing

---

## Support

For questions, issues, or contributions:
- Review documentation in `/docs`
- Check GitHub issues
- Submit bug reports with details
- Follow contribution guidelines

---

**Note**: This project follows semantic versioning. Major version (1.x.x) indicates the phase is production-ready.


