# Learning Platform Security Documentation

This document outlines the security measures implemented in the Learning Platform application, particularly for deployment in Learning Management Systems (LMS) like Canvas and Blackboard.

## Security Features

### 1. Session Management
- HTTP-only cookies to prevent JavaScript access
- Secure cookies (in production) to ensure HTTPS-only transmission
- SameSite cookie policy configured for iframe embedding
- UUID-based unique session identifiers
- Database-backed session validation

### 2. CORS Configuration
- Allowlist of approved LMS domains:
  - Canvas (*.instructure.com)
  - Blackboard (*.blackboard.com)
  - Other popular LMS platforms
- Proper handling of preflight requests
- Credentials allowed for authenticated requests

### 3. Content Security Policy (CSP)
- Restricted script sources
- Controlled connection endpoints
- Frame-ancestors limited to approved LMS domains
- Secure resource loading policies

### 4. Additional Security Headers
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- X-Frame-Options: ALLOW-FROM (approved domains)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrictions on sensitive features

### 5. Data Privacy
- User data isolated through session IDs
- All conversations stored with proper user association
- Webhooks preserve session context throughout the flow
- No cross-user data leakage

## LMS Integration Guidance

### Canvas Integration
1. Configure Canvas to load the application in an iframe
2. Use the proper LTI configuration (future enhancement)
3. Ensure Canvas domain is in the allowed origins list

### Blackboard Integration
1. Configure Blackboard to load the application in an iframe
2. Use the proper LTI configuration (future enhancement)
3. Ensure Blackboard domain is in the allowed origins list

## Future Security Enhancements

1. **Full LTI Integration**: Implement complete Learning Tools Interoperability for seamless LMS authentication
2. **Data Retention Policies**: Implement automatic cleanup of old user data
3. **FERPA Compliance Documentation**: Create comprehensive documentation for educational data privacy
4. **Enhanced Authentication**: Add support for institutional SSO integration

## Security Configuration

Security settings are managed in the following files:
- `server/middleware/security.ts`: Core security policies and configurations
- `server/middleware/session.ts`: Session management with secure cookie settings
- `server/index.ts`: Security middleware integration

## Testing Security

To test the security features in a local environment, you can:

1. Use browser developer tools to inspect headers and cookies
2. Verify that cookies have the appropriate security attributes
3. Test embedding in an iframe from an approved domain
4. Confirm that cross-origin requests follow the expected CORS behavior

## Contact

For security-related questions or to report security concerns, please contact the platform administrators.