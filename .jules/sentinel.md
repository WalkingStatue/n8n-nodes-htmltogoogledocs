## 2024-05-23 - Hardcoded Multipart Boundary Injection
**Vulnerability:** Found a hardcoded multipart boundary 'foo_bar_baz' in `HtmlToGoogleDocs`. This allows an attacker to inject arbitrary content or terminate the request prematurely by including the boundary string in the input.
**Learning:** Manual construction of multipart bodies is prone to boundary injection if static boundaries are used.
**Prevention:** Always generate a random boundary using `crypto.randomBytes` or similar for each request.
