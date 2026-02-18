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
                    description: 'The HTML content to upload. If not specified, the node will try to read the "html" property from the input item.',
                    typeOptions: {
                        rows: 6,
                    },
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const credentials = await this.getCredentials('googleDriveOAuth2Api');
        if (!credentials) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Failed to retrieve Google Drive credentials');
        }
        const promises = items.map(async (item, i) => {
            try {
                const documentName = this.getNodeParameter('documentName', i);
                let htmlContent = this.getNodeParameter('htmlContent', i);
                if (!htmlContent && item.json.html) {
                    htmlContent = item.json.html;
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
                return {
                    json: response,
                    pairedItem: {
                        item: i,
                    },
                };
            }
            catch (error) {
                if (this.continueOnFail()) {
                    return {
                        json: {
                            error: error.message,
                        },
                        pairedItem: {
                            item: i,
                        },
                    };
                }
                throw error;
            }
        });
        const returnData = await Promise.all(promises);
        return [returnData];
    }
}
exports.HtmlToGoogleDocs = HtmlToGoogleDocs;
//# sourceMappingURL=HtmlToGoogleDocs.node.js.map