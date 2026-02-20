import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import * as crypto from 'crypto';

export class HtmlToGoogleDocs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HTML to Google Docs',
		name: 'htmlToGoogleDocs',
		icon: 'file:googledocs.svg',
		group: ['output'],
		version: 1,
		description: 'Upload HTML content to Google Docs',
		defaults: {
			name: 'HTML to Google Docs',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'googleDriveOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Document Name',
				name: 'documentName',
				type: 'string',
				default: '',
				placeholder: 'My Document',
				description: 'Name of the Google Doc to create',
				required: true,
			},
			{
				displayName: 'HTML Content',
				name: 'htmlContent',
				type: 'string',
				default: '',
				placeholder: '<h1>My Document</h1>',
				description: 'The HTML content to upload. If not specified, the node will try to read the "html" property from the input item.',
				typeOptions: {
					rows: 6,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('googleDriveOAuth2Api');
		
		// Use the credentials to ensure they're read
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'Failed to retrieve Google Drive credentials');
		}
		
		for (let i = 0; i < items.length; i++) {
			try {
				const documentName = this.getNodeParameter('documentName', i) as string;
				let htmlContent = this.getNodeParameter('htmlContent', i) as string;
				
				// If HTML content is empty, try to get it from the input item
				if (!htmlContent && items[i].json.html) {
					htmlContent = items[i].json.html as string;
				}
				
				// Create multipart body
				const boundary = `n8n-${crypto.randomBytes(16).toString('hex')}`;
				const metadata = {
					name: documentName,
					mimeType: 'application/vnd.google-apps.document'
				};
				
				const body = [
					`--${boundary}`,
					'Content-Type: application/json; charset=UTF-8',
					'',
					JSON.stringify(metadata),
					`--${boundary}`,
					'Content-Type: text/html; charset=UTF-8',
					'',
					htmlContent,
					`--${boundary}--`
				].join('\n');

				// Make the API request with proper OAuth2 authentication
				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'googleDriveOAuth2Api', {
					method: 'POST',
					url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
					headers: {
						'Content-Type': `multipart/related; boundary=${boundary}`
					},
					body
				});

				returnData.push({
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}