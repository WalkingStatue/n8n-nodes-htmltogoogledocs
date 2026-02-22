## 2024-05-23 - n8n Node Sequential Execution
**Learning:** n8n nodes often default to sequential processing in `execute` methods using `for` loops. This kills performance for batch operations.
**Action:** Always look for `for (let i = 0; i < items.length; i++)` loops containing `await` in `execute` methods and refactor to `Promise.all(items.map(...))` for parallel execution where API rate limits allow.
