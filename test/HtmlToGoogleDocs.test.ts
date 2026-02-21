import { HtmlToGoogleDocs } from '../nodes/HtmlToGoogleDocs/HtmlToGoogleDocs.node';
import { IExecuteFunctions } from 'n8n-workflow';

async function test() {
    console.log('Running test...');
    const node = new HtmlToGoogleDocs();

    let capturedOptions: any;

    const mockExecuteFunctions = {
        getInputData: () => [{ json: { html: 'some html' } }],
        getCredentials: async () => ({}),
        getNodeParameter: (paramName: string) => {
            if (paramName === 'documentName') return 'Test Doc';
            if (paramName === 'htmlContent') return '<html>...</html>';
            return '';
        },
        helpers: {
            httpRequestWithAuthentication: {
                call: async function(thisArg: any, credentialType: string, options: any) {
                    capturedOptions = options;
                    return { success: true };
                }
            }
        },
        continueOnFail: () => false,
        getNode: () => ({ name: 'HtmlToGoogleDocs' }),
    } as unknown as IExecuteFunctions;

    await node.execute.call(mockExecuteFunctions);

    if (!capturedOptions) {
        throw new Error('httpRequestWithAuthentication was not called');
    }

    const contentType = capturedOptions.headers['Content-Type'];
    const boundaryMatch = contentType.match(/boundary=(.+)/);

    if (!boundaryMatch) {
        throw new Error('Boundary not found in Content-Type');
    }

    const boundary = boundaryMatch[1];
    console.log('Generated boundary:', boundary);

    if (boundary === 'foo_bar_baz') {
        throw new Error('Boundary is still the hardcoded "foo_bar_baz"');
    }

    if (boundary.length < 10) {
            throw new Error('Boundary is too short to be random');
    }

    // Verify boundary usage in body
    if (!capturedOptions.body.includes(`--${boundary}`)) {
        throw new Error('Body does not contain the generated boundary');
    }

    console.log('Test passed!');
}

test().catch(e => {
    console.error(e);
    process.exit(1);
});
