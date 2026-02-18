## 2025-05-21 - Multipart Boundary Injection
**Vulnerability:** Hardcoded multipart boundary in HTTP requests.
**Learning:** Hardcoded boundaries can allow attackers to inject new parts into a multipart request if they control the content.
**Prevention:** Always use dynamically generated random boundaries for multipart requests.
