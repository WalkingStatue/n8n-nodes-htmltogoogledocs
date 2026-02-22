# Sentinel's Journal

## 2025-02-18 - Hardcoded Multipart Boundary
**Vulnerability:** A hardcoded multipart boundary ('foo_bar_baz') was found in `HtmlToGoogleDocs.node.ts`.
**Learning:** Hardcoded boundaries can lead to injection attacks if the boundary string appears in the user input. In n8n nodes, manual multipart construction must use dynamic boundaries.
**Prevention:** Use `crypto.randomBytes` to generate unique boundaries for each request.
