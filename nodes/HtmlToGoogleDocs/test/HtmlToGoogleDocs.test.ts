import { HtmlToGoogleDocs } from '../HtmlToGoogleDocs.node';
import { IExecuteFunctions } from 'n8n-workflow';

describe('HtmlToGoogleDocs', () => {
	it('should use a random boundary for multipart requests', async () => {
		const node = new HtmlToGoogleDocs();

		const executeFunctionsMock = {
			getInputData: jest.fn().mockReturnValue([{ json: { html: '<h1>Test</h1>' } }]),
			getCredentials: jest.fn().mockResolvedValue({}),
			getNodeParameter: jest.fn((paramName) => {
				if (paramName === 'documentName') return 'Test Doc';
				if (paramName === 'htmlContent') return '<h1>Test</h1>';
				return '';
			}),
			helpers: {
				httpRequestWithAuthentication: jest.fn().mockResolvedValue({ id: '123' }),
			},
			getNode: jest.fn().mockReturnValue({}),
			continueOnFail: jest.fn().mockReturnValue(false),
		} as unknown as IExecuteFunctions;

		await node.execute.call(executeFunctionsMock);

		const httpRequestMock = executeFunctionsMock.helpers.httpRequestWithAuthentication as jest.Mock;
		expect(httpRequestMock).toHaveBeenCalled();

		const callArgs = httpRequestMock.mock.calls[0];
		const options = callArgs[1];
		const contentType = options.headers['Content-Type'];

		expect(contentType).toBeDefined();
		const boundaryMatch = contentType.match(/boundary=(.+)/);
		expect(boundaryMatch).not.toBeNull();
		const boundary = boundaryMatch![1];

		expect(boundary).not.toBe('foo_bar_baz');
	});

	it('should generate unique boundaries for multiple items', async () => {
		const node = new HtmlToGoogleDocs();

		const executeFunctionsMock = {
			getInputData: jest.fn().mockReturnValue([
				{ json: { html: '<h1>Test 1</h1>' } },
				{ json: { html: '<h1>Test 2</h1>' } }
			]),
			getCredentials: jest.fn().mockResolvedValue({}),
			getNodeParameter: jest.fn((paramName, i) => {
				if (paramName === 'documentName') return `Test Doc ${i}`;
				if (paramName === 'htmlContent') return `<h1>Test ${i}</h1>`;
				return '';
			}),
			helpers: {
				httpRequestWithAuthentication: jest.fn().mockResolvedValue({ id: '123' }),
			},
			getNode: jest.fn().mockReturnValue({}),
			continueOnFail: jest.fn().mockReturnValue(false),
		} as unknown as IExecuteFunctions;

		await node.execute.call(executeFunctionsMock);

		const httpRequestMock = executeFunctionsMock.helpers.httpRequestWithAuthentication as jest.Mock;
		expect(httpRequestMock).toHaveBeenCalledTimes(2);

		const call1 = httpRequestMock.mock.calls[0];
		const call2 = httpRequestMock.mock.calls[1];

		const boundaryMatch1 = call1[1].headers['Content-Type'].match(/boundary=(.+)/);
		const boundaryMatch2 = call2[1].headers['Content-Type'].match(/boundary=(.+)/);

		expect(boundaryMatch1).not.toBeNull();
		expect(boundaryMatch2).not.toBeNull();

		expect(boundaryMatch1![1]).not.toBe(boundaryMatch2![1]);
	});
});
