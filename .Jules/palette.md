## 2025-02-17 - Error Handling UX in n8n Nodes
**Learning:** n8n nodes often silently proceed with empty inputs (like missing parameter/input property), leading to confusing outcomes (e.g. empty files). Adding explicit validation for required content significantly improves debuggability.
**Action:** When working on n8n nodes, check if critical parameters have fallbacks that might fail silently, and add `NodeOperationError` with clear descriptions.
