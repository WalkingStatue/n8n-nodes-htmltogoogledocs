"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlToGoogleDocs = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const crypto = __importStar(require("crypto"));
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
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
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
                const boundary = crypto.randomBytes(16).toString('hex');
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