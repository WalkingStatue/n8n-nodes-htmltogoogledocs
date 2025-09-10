![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# HTML to Google Docs Node for n8n

This is an n8n community node that allows you to upload HTML content directly to Google Docs. With this node, you can automate the creation of Google Docs documents from HTML content in your n8n workflows.

## Features

- Convert HTML content to Google Docs format
- Create new Google Docs documents programmatically
- Support for rich HTML formatting (headings, lists, links, etc.)
- Authentication via Google OAuth2

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Alternatively, you can install the node directly from npm:

```bash
npm install n8n-nodes-htmltogoogledocs
```

## Operations

This node allows you to:

- Upload HTML content to Google Docs
- Create new Google Docs documents with HTML content

## Credentials

To use this node, you need to authenticate with Google Drive using OAuth2.

### Prerequisites

1. You need a Google account
2. Enable the Google Drive API in your Google Cloud Console
3. Create OAuth2 credentials (Client ID and Client Secret)

### Setup

1. In n8n, go to Settings > Credentials
2. Click on "Add Credential"
3. Select "Google Drive OAuth2 API" (predefined credential)
4. Click on "Connect my account" and follow the OAuth flow

## Compatibility

This node is compatible with n8n version 0.1.0 and above.

## Usage

1. Add the HTML to Google Docs node to your workflow
2. Configure the credentials by selecting your Google Drive OAuth2 account
3. Enter the document name for your new Google Doc
4. Provide the HTML content you want to upload
5. Execute the workflow

The node will create a new Google Doc with your HTML content converted to Google Docs format.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Google Drive API documentation](https://developers.google.com/drive/api)

## License

[MIT](https://github.com/WalkingStatue/n8n-nodes-htmltogoogledocs/blob/master/LICENSE.md)
