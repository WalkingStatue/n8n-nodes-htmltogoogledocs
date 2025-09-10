"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlToGoogleDocs = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class HtmlToGoogleDocs {
    constructor() {
        this.description = {
            displayName: 'HTML to Google Docs',
            name: 'htmlToGoogleDocs',
            icon: 'file:googledocs.svg',
            group: ['output'],
            version: 1,
            description: 'Upload HTML content to Google Docs',
            defaults: {
                name: 'HTML to Google Docs',
            },
            inputs: ["main"],
            outputs: ["main"],
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
                    description: 'HTML content to upload to Google Docs',
                    typeOptions: {
                        rows: 6,
                    },
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('googleDriveOAuth2Api');
        if (!credentials) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Failed to retrieve Google Drive credentials');
        }
        for (let i = 0; i < items.length; i++) {
            try {
                const documentName = this.getNodeParameter('documentName', i);
                let htmlContent = this.getNodeParameter('htmlContent', i);
                if (!htmlContent && items[i].json.html) {
                    htmlContent = items[i].json.html;
                }
                const boundary = 'foo_bar_baz';
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
            }
            catch (error) {
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
exports.HtmlToGoogleDocs = HtmlToGoogleDocs;
//# sourceMappingURL=HtmlToGoogleDocs.node.js.map