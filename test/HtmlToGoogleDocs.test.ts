import { HtmlToGoogleDocs } from '../nodes/HtmlToGoogleDocs/HtmlToGoogleDocs.node';
import { IExecuteFunctions } from 'n8n-workflow';

// Mock n8n helpers
const mockHelpers = {
    // Define as a regular function so .call works as expected
    httpRequestWithAuthentication: async function(this: any, credentialsName: string, options: any) {
        console.log('Mock httpRequestWithAuthentication called');
        // console.log('Credentials:', credentialsName);
        // console.log('Options:', options);

        if (!options || !options.headers) {
             throw new Error('Options or headers missing');
        }

        const boundaryMatch = options.headers['Content-Type'].match(/boundary=(.+)/);
        if (!boundaryMatch) {
            throw new Error('Security Check Failed: No boundary found in Content-Type');
        }

        const boundary = boundaryMatch[1];
        console.log('Boundary used:', boundary);

        // Validate boundary
        if (boundary === 'foo_bar_baz') {
            throw new Error('Security Check Failed: Boundary is hardcoded "foo_bar_baz"');
        }
        if (!boundary.startsWith('n8n-boundary-')) {
             throw new Error('Security Check Failed: Boundary does not start with "n8n-boundary-"');
        }
        // "n8n-boundary-" is 13 chars. 16 bytes hex is 32 chars. Total 45.
        if (boundary.length < 40) {
             throw new Error(`Security Check Failed: Boundary seems too short: ${boundary.length}`);
        }

        // Check body for boundary usage
        if (!options.body.includes(`--${boundary}`)) {
            throw new Error('Security Check Failed: Body does not contain the boundary');
        }

        console.log('Security Check Passed!');
        return { success: true };
    }
};

// Mock IExecuteFunctions
const mockExecuteFunctions = {
    getInputData: () => [{ json: { html: '<h1>Test</h1>' } }],
    getCredentials: async () => ({ oauth: 'token' }),
    getNodeParameter: (paramName: string) => {
        if (paramName === 'documentName') return 'Test Doc';
        if (paramName === 'htmlContent') return '';
        return '';
    },
    helpers: mockHelpers,
    getNode: () => ({ name: 'test' }),
    continueOnFail: () => false,
} as unknown as IExecuteFunctions;

async function runTest() {
    const node = new HtmlToGoogleDocs();
    try {
        // We need to bind the execute function to our mock context?
        // No, node.execute calls helpers.httpRequest...call(this, ...)
        // The 'this' in execute is mockExecuteFunctions.
        await node.execute.call(mockExecuteFunctions);
        console.log('Test execution completed successfully.');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

runTest();
