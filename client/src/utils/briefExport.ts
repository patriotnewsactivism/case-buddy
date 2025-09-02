import { GeneratedBrief } from '@shared/types';

export interface ExportOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  pageNumbers?: boolean;
  fontFamily?: string;
  fontSize?: string;
}

export function getFormattedFilename(briefTitle: string, caseNumber?: string): string {
  const sanitizedTitle = briefTitle.replace(/[^a-z0-9]/gi, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  const casePrefix = caseNumber ? `${caseNumber}_` : '';
  return `${casePrefix}${sanitizedTitle}_${timestamp}`;
}

export function exportBriefAsText(brief: GeneratedBrief, filename: string): void {
  let content = `${brief.title}\n`;
  content += '='.repeat(brief.title.length) + '\n\n';
  
  // Table of Contents
  content += 'TABLE OF CONTENTS\n\n';
  brief.tableOfContents.forEach(item => {
    content += `${item.section} ........................ ${item.page}\n`;
  });
  content += '\n';
  
  // Sections
  brief.sections.forEach((section, index) => {
    content += `${index + 1}. ${section.heading}\n`;
    content += '-'.repeat(section.heading.length + 3) + '\n';
    content += section.content + '\n\n';
    
    if (section.citations && section.citations.length > 0) {
      content += 'Citations:\n';
      section.citations.forEach(citation => {
        content += `- ${citation}\n`;
      });
      content += '\n';
    }
  });
  
  // Footer
  content += `\nGenerated on: ${brief.generatedAt.toLocaleDateString()}\n`;
  content += `Word Count: ${brief.wordCount}\n`;
  
  downloadFile(content, filename + '.txt', 'text/plain');
}

export function exportBriefAsHTML(brief: GeneratedBrief, filename: string, options: ExportOptions = {}): void {
  const {
    includeHeader = true,
    includeFooter = true,
    pageNumbers = true,
    fontFamily = 'Times New Roman, serif',
    fontSize = '12pt'
  } = options;
  
  let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${brief.title}</title>
    <style>
        body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: 1.6;
            margin: 1in;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 2em;
            border-bottom: 2px solid #000;
            padding-bottom: 1em;
        }
        .title {
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 0.5em;
        }
        .toc {
            margin: 2em 0;
            page-break-after: always;
        }
        .toc-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 1em;
            text-transform: uppercase;
        }
        .toc-item {
            display: flex;
            justify-content: space-between;
            margin: 0.5em 0;
            padding: 0 1em;
        }
        .section {
            margin: 2em 0;
            page-break-inside: avoid;
        }
        .section-heading {
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 1em;
            text-transform: uppercase;
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.5em;
        }
        .section-content {
            text-align: justify;
            margin-bottom: 1.5em;
        }
        .citations {
            margin-top: 1em;
            padding: 1em;
            background-color: #f9f9f9;
            border-left: 3px solid #ccc;
        }
        .citations-title {
            font-weight: bold;
            margin-bottom: 0.5em;
        }
        .citation {
            margin: 0.25em 0;
            font-style: italic;
        }
        .footer {
            margin-top: 3em;
            padding-top: 1em;
            border-top: 1px solid #ccc;
            font-size: 10pt;
            color: #666;
        }
        @media print {
            body { margin: 0.75in; }
            .page-break { page-break-before: always; }
        }
        ${pageNumbers ? `
        @page {
            @bottom-center {
                content: "Page " counter(page);
            }
        }
        ` : ''}
    </style>
</head>
<body>`;

  if (includeHeader) {
    html += `
    <div class="header">
        <div class="title">${brief.title}</div>
        <div>Generated on ${brief.generatedAt.toLocaleDateString()}</div>
    </div>`;
  }

  // Table of Contents
  html += `
    <div class="toc">
        <div class="toc-title">Table of Contents</div>`;
  
  brief.tableOfContents.forEach(item => {
    html += `
        <div class="toc-item">
            <span>${item.section}</span>
            <span>${item.page}</span>
        </div>`;
  });
  
  html += `</div>`;

  // Sections
  brief.sections.forEach((section, index) => {
    html += `
    <div class="section${index > 0 ? ' page-break' : ''}">
        <div class="section-heading">${section.heading}</div>
        <div class="section-content">${section.content.replace(/\n/g, '<br>')}</div>`;
    
    if (section.citations && section.citations.length > 0) {
      html += `
        <div class="citations">
            <div class="citations-title">Citations:</div>`;
      
      section.citations.forEach(citation => {
        html += `<div class="citation">${citation}</div>`;
      });
      
      html += `</div>`;
    }
    
    html += `</div>`;
  });

  if (includeFooter) {
    html += `
    <div class="footer">
        <div>Word Count: ${brief.wordCount}</div>
        <div>Generated by CaseBuddy Legal AI on ${brief.generatedAt.toLocaleString()}</div>
    </div>`;
  }

  html += `
</body>
</html>`;
  
  downloadFile(html, filename + '.html', 'text/html');
}

export function exportBriefAsWord(brief: GeneratedBrief, filename: string): void {
  // Create a Word-compatible HTML document
  let content = `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<meta name=ProgId content=Word.Document>
<meta name=Generator content="Microsoft Word 15">
<meta name=Originator content="Microsoft Word 15">
<!--[if !mso]>
<style>
v\\:* {behavior:url(#default#VML);}
o\\:* {behavior:url(#default#VML);}
w\\:* {behavior:url(#default#VML);}
.shape {behavior:url(#default#VML);}
</style>
<![endif]-->
<style>
@page {
  margin: 1in;
}
body {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 1.5;
}
.title {
  text-align: center;
  font-weight: bold;
  font-size: 18pt;
  text-transform: uppercase;
  margin-bottom: 24pt;
}
.section-heading {
  font-weight: bold;
  font-size: 14pt;
  margin-top: 18pt;
  margin-bottom: 12pt;
  text-transform: uppercase;
}
.toc {
  margin: 24pt 0;
}
.toc-title {
  font-weight: bold;
  text-align: center;
  font-size: 14pt;
  text-transform: uppercase;
  margin-bottom: 12pt;
}
.toc-item {
  margin: 6pt 0;
}
</style>
</head>
<body>`;

  content += `<div class="title">${brief.title}</div>`;
  
  // Table of Contents
  content += `<div class="toc">
    <div class="toc-title">Table of Contents</div>`;
  
  brief.tableOfContents.forEach(item => {
    content += `<div class="toc-item">${item.section} ..................................... ${item.page}</div>`;
  });
  
  content += `</div>`;

  // Sections
  brief.sections.forEach(section => {
    content += `
    <div class="section-heading">${section.heading}</div>
    <p>${section.content.replace(/\n/g, '</p><p>')}</p>`;
    
    if (section.citations && section.citations.length > 0) {
      content += `<p><strong>Citations:</strong></p><ul>`;
      section.citations.forEach(citation => {
        content += `<li><em>${citation}</em></li>`;
      });
      content += `</ul>`;
    }
  });

  content += `
<hr>
<p><small>Generated on ${brief.generatedAt.toLocaleDateString()} | Word Count: ${brief.wordCount} | CaseBuddy Legal AI</small></p>
</body>
</html>`;
  
  downloadFile(content, filename + '.doc', 'application/msword');
}

export function exportBriefForPrint(brief: GeneratedBrief): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups for this site to enable printing');
    return;
  }
  
  const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Print - ${brief.title}</title>
    <style>
        @media print {
            @page {
                margin: 0.75in;
                @bottom-center {
                    content: "Page " counter(page);
                }
            }
            body {
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.6;
                color: black;
            }
            .no-print {
                display: none;
            }
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 20px;
        }
        .title {
            text-align: center;
            font-weight: bold;
            font-size: 18pt;
            text-transform: uppercase;
            margin-bottom: 24pt;
            border-bottom: 2px solid black;
            padding-bottom: 12pt;
        }
        .section-heading {
            font-weight: bold;
            font-size: 14pt;
            margin-top: 18pt;
            margin-bottom: 12pt;
            text-transform: uppercase;
            page-break-after: avoid;
        }
        .section-content {
            text-align: justify;
            margin-bottom: 18pt;
            page-break-inside: avoid;
        }
        .toc {
            margin: 24pt 0;
            page-break-after: always;
        }
        .toc-title {
            font-weight: bold;
            text-align: center;
            font-size: 14pt;
            text-transform: uppercase;
            margin-bottom: 12pt;
        }
        .toc-item {
            display: flex;
            justify-content: space-between;
            margin: 6pt 0;
        }
        .print-controls {
            margin: 20px 0;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 5px;
        }
        .print-button {
            background: #007cba;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        .print-button:hover {
            background: #005a8b;
        }
    </style>
</head>
<body>
    <div class="print-controls no-print">
        <button class="print-button" onclick="window.print()">Print Brief</button>
        <button class="print-button" onclick="window.close()">Close</button>
    </div>
    
    <div class="title">${brief.title}</div>
    
    <div class="toc">
        <div class="toc-title">Table of Contents</div>
        ${brief.tableOfContents.map(item => 
          `<div class="toc-item">
             <span>${item.section}</span>
             <span>${item.page}</span>
           </div>`
        ).join('')}
    </div>
    
    ${brief.sections.map(section => 
      `<div class="section-heading">${section.heading}</div>
       <div class="section-content">${section.content.replace(/\n/g, '<br>')}</div>`
    ).join('')}
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10pt; color: #666;">
        <p>Generated on ${brief.generatedAt.toLocaleDateString()} | Word Count: ${brief.wordCount}</p>
        <p>Generated by CaseBuddy Legal AI</p>
    </div>
</body>
</html>`;
  
  printWindow.document.write(content);
  printWindow.document.close();
}

export async function copyBriefToClipboard(brief: GeneratedBrief): Promise<void> {
  let content = `${brief.title}\n`;
  content += '='.repeat(brief.title.length) + '\n\n';
  
  brief.sections.forEach((section, index) => {
    content += `${index + 1}. ${section.heading}\n`;
    content += section.content + '\n\n';
  });
  
  content += `Generated on: ${brief.generatedAt.toLocaleDateString()}\n`;
  content += `Word Count: ${brief.wordCount}`;
  
  await navigator.clipboard.writeText(content);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}