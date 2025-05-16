# LMS Integration Guide

This document provides instructions for embedding this application in a Learning Management System (LMS) or any other website using an iframe.

## Quick Integration

To embed this application in your website or LMS, use the following HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Embedded Learning Experience</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
    }
    .app-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    iframe {
      flex: 1;
      width: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <iframe 
      src="https://cdfe8c71-15fd-4edb-a06c-d5f5777fa119.id.replit.dev" 
      allow="fullscreen; microphone; camera" 
      title="Interactive Learning Experience">
    </iframe>
  </div>
</body>
</html>
```

Your application is deployed at `https://cdfe8c71-15fd-4edb-a06c-d5f5777fa119.id.replit.dev`. This is the URL to use when embedding the app in an iframe.

## Integration Options

### Resizable Integration

For a better user experience, you might want to allow users to resize the iframe. We've included a resizable example in `iframe_resizable_example.html` that you can adapt:

```html
<div class="controls">
  <button onclick="resizeIframe('small')">Small</button>
  <button onclick="resizeIframe('medium')">Medium</button>
  <button onclick="resizeIframe('large')">Large</button>
  <button onclick="resizeIframe('full')">Full Height</button>
</div>

<div class="iframe-container" id="iframe-container">
  <iframe 
    src="https://cdfe8c71-15fd-4edb-a06c-d5f5777fa119.id.replit.dev" 
    allow="fullscreen; microphone; camera" 
    title="Interactive Learning Experience"
    id="learning-iframe">
  </iframe>
</div>

<script>
  function resizeIframe(size) {
    const container = document.getElementById('iframe-container');
    switch(size) {
      case 'small': container.style.height = '400px'; break;
      case 'medium': container.style.height = '600px'; break;
      case 'large': container.style.height = '800px'; break;
      case 'full': container.style.height = (window.innerHeight - 300) + 'px'; break;
    }
  }
</script>
```

### LMS-Specific Integration

This application is designed to work within popular Learning Management Systems:

#### Canvas LMS

1. Go to your Canvas course
2. Navigate to "Pages" or "Modules" where you want to add the content
3. Create a new page or edit an existing one
4. Click the "HTML Editor" button to switch to HTML mode
5. Paste the following code:

```html
<iframe 
  src="https://cdfe8c71-15fd-4edb-a06c-d5f5777fa119.id.replit.dev" 
  width="100%" 
  height="600px" 
  allow="fullscreen; microphone; camera"
  style="border: none;">
</iframe>
```

6. Adjust the height as needed (600px is recommended minimum)
7. Save the page

#### Blackboard

1. Go to your Blackboard course
2. Navigate to "Content" where you want to add the application
3. Click "Build Content" and select "Item"
4. In the content editor, click the HTML button to switch to HTML mode
5. Paste the iframe code shown above
6. Click "Submit" to save

#### Moodle

1. Go to your Moodle course
2. Turn editing on
3. In the section where you want to add the application, click "Add an activity or resource"
4. Select "Page" and click "Add"
5. In the content editor, click the "<>" button to access the HTML source
6. Paste the iframe code shown above
7. Save the page

## Security and Cookie Settings

This application implements the following security features for safe integration:

1. **Cross-Origin Resource Sharing (CORS)**: Configured to allow embedding only from allowed domains
2. **Content Security Policy (CSP)**: Set to allow necessary resources while maintaining security
3. **Secure Cookies**: Properly configured for cross-domain embedding

## Allowed Domains for Embedding

The application can currently be embedded from the following domains:

- Canvas: `*.instructure.com`
- Blackboard: `*.blackboard.com`
- Moodle: `*.moodlecloud.com`
- Brightspace: `*.brightspace.com`
- Development: `localhost:*` and `*.replit.app`

If you need to embed from a different domain, please contact the administrator to update the allowed domains list.

## Troubleshooting

If you experience issues with the iframe integration:

1. **X-Frame-Options Error**: Contact the administrator to add your domain to the allowed list
2. **Cookies Not Working**: Make sure third-party cookies are enabled in your browser
3. **Content Not Loading**: Check the browser console for specific error messages

## Support

For additional help or to request features, please contact the application administrator.