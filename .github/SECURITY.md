# Security Policy & Cryptographic Trust

## Supported Versions

To protect the confidentiality of anonymous whistleblower data, we recommend upgrading to updates promptly. We actively maintain and apply security hotfixes to the following release ranges:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

**DO NOT lodge security disclosures through public GitHub issues.** 

If you identify a security vulnerability, please email **ibnaratul.2025@gmail.com** with details of your discovery.
Once we receive your notification, we will:
1. Contact you to verify details and collaborate on immediate remediation.
2. Draft a private advisory and coordinate a secure deployment patch.
3. Publish a public post-mortem credit note acknowledging your valuable support.

## Key Hygiene & Secret Auditing

1. **Server Secrets**: NEVER commit or expose the `GEMINI_API_KEY` to public client-side scopes or repositories. It must reside strictly in secure environment storage (e.g., GitHub Repos Secrets, Google Cloud Run secrets, or system-level environment variables).
2. **Local Environment Safety**: Keep your `.env` excluded from active source control via the root `.gitignore` file. Ensure only `.env.example` remains tracked as a structural configuration skeleton.
3. **Network Integrity**: All external API handshakes should filter through secure Node.js proxy routes (`/api/*`) on the server to prevent standard browser-side inspection of developer or server credentials.
