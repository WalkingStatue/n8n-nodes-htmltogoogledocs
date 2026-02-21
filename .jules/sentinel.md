## 2024-03-24 - [Multipart Boundary Injection]
**Vulnerability:** Hardcoded multipart boundary 'foo_bar_baz' could allow users to inject malicious content into the request body if their input contained the boundary string.
**Learning:** Hardcoded boundaries are predictable and can be exploited. Always use random boundaries.
**Prevention:** Use `crypto.randomBytes(16).toString('hex')` to generate unique boundaries for each request.
