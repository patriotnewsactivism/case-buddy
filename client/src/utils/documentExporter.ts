
export interface DocumentExportOptions {
  format: 'txt' | 'html' | 'word';
  filename: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
}

export class DocumentExporter {
  
  static exportAsText(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    this.downloadFile(blob, `${filename}.txt`);
  }

  static exportAsHTML(content: string, filename: string, title?: string): void {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'CaseBuddy Documentation'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }
        h2 {
            color: #1e40af;
            margin-top: 30px;
        }
        h3 {
            color: #1e3a8a;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .feature-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    ${content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>').replace(/# (.*?)(<br>|$)/g, '<h1>$1</h1>')}
    
    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>CaseBuddy - Your Legal Case Assistant</p>
    </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    this.downloadFile(blob, `${filename}.html`);
  }

  static exportAsWord(content: string, filename: string, title?: string): void {
    const wordContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <title>${title || 'CaseBuddy Documentation'}</title>
    <style>
        body {
            font-family: 'Calibri', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
        }
        h1 {
            font-size: 18pt;
            color: #2563eb;
            font-weight: bold;
        }
        h2 {
            font-size: 14pt;
            color: #1e40af;
            font-weight: bold;
            margin-top: 18pt;
        }
        h3 {
            font-size: 12pt;
            color: #1e3a8a;
            font-weight: bold;
        }
        .MsoNormal {
            margin: 0pt 0pt 12pt 0pt;
        }
    </style>
</head>
<body>
    ${content.replace(/\n/g, '</p><p class="MsoNormal">').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/## (.*?)(<\/p>|$)/g, '<h2>$1</h2><p class="MsoNormal">').replace(/# (.*?)(<\/p>|$)/g, '<h1>$1</h1><p class="MsoNormal">').replace(/^/, '<p class="MsoNormal">').replace(/$/, '</p>')}
</body>
</html>`;

    const blob = new Blob([wordContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    this.downloadFile(blob, `${filename}.doc`);
  }

  private static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static getFormattedFilename(baseTitle: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeTitle = baseTitle.replace(/[^a-zA-Z0-9-]/g, '_');
    return `${safeTitle}_${timestamp}`;
  }
}

// Convenience functions
export const exportAsText = (content: string, filename: string) => 
  DocumentExporter.exportAsText(content, filename);

export const exportAsHTML = (content: string, filename: string, title?: string) => 
  DocumentExporter.exportAsHTML(content, filename, title);

export const exportAsWord = (content: string, filename: string, title?: string) => 
  DocumentExporter.exportAsWord(content, filename, title);

export const getFormattedFilename = (baseTitle: string) => 
  DocumentExporter.getFormattedFilename(baseTitle);
