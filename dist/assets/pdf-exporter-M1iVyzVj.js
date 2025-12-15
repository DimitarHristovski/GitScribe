async function m(o){console.log(`[PDFExporter] Exporting ${o.type} to PDF...`);try{let e="";if(o.html)e=o.html;else if(o.markdown)e=await d(o.markdown);else throw new Error("No content available for PDF export");const t=a(o.title,e),r=await c(t);return URL.createObjectURL(r)}catch(e){throw console.error("[PDFExporter] Error exporting to PDF:",e),new Error(`Failed to export PDF: ${e.message}`)}}async function d(o){let e=o;return e=e.replace(/^### (.*$)/gim,"<h3>$1</h3>"),e=e.replace(/^## (.*$)/gim,"<h2>$1</h2>"),e=e.replace(/^# (.*$)/gim,"<h1>$1</h1>"),e=e.replace(/\*\*(.*?)\*\*/gim,"<strong>$1</strong>"),e=e.replace(/\*(.*?)\*/gim,"<em>$1</em>"),e=e.replace(/```([\s\S]*?)```/gim,"<pre><code>$1</code></pre>"),e=e.replace(/`([^`]+)`/gim,"<code>$1</code>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/gim,'<a href="$2">$1</a>'),e=e.replace(/^\* (.*$)/gim,"<li>$1</li>"),e=e.replace(/^- (.*$)/gim,"<li>$1</li>"),e=e.replace(/(<li>.*<\/li>)/s,"<ul>$1</ul>"),e=e.split(`

`).map(t=>t.trim()?t.startsWith("<")?t:`<p>${t}</p>`:"").join(`
`),e}function a(o,e){return`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${o}</title>
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #f97316;
      border-bottom: 3px solid #f97316;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    h2 {
      color: #ea580c;
      margin-top: 25px;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 8px;
    }
    h3 {
      color: #c2410c;
      margin-top: 20px;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    a {
      color: #f97316;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul, ol {
      margin-left: 20px;
    }
    blockquote {
      border-left: 4px solid #f97316;
      margin-left: 0;
      padding-left: 20px;
      color: #666;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #f97316;
      color: white;
    }
    .doc-html-content {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>${o}</h1>
  <div class="doc-html-content">
    ${e}
  </div>
</body>
</html>
  `.trim()}async function c(o){return new Promise((e,t)=>{var l;const r=document.createElement("iframe");r.style.position="fixed",r.style.right="0",r.style.bottom="0",r.style.width="0",r.style.height="0",r.style.border="none",document.body.appendChild(r);const n=r.contentDocument||((l=r.contentWindow)==null?void 0:l.document);if(!n){t(new Error("Could not access iframe document"));return}n.open(),n.write(o),n.close(),r.onload=()=>{try{const i=new Blob([o],{type:"text/html"});setTimeout(()=>{document.body.removeChild(r)},100),e(i)}catch(i){document.body.removeChild(r),t(i)}}})}function p(o,e){const t=document.createElement("a");t.href=o,t.download=e.endsWith(".pdf")?e:`${e}.pdf`,document.body.appendChild(t),t.click(),document.body.removeChild(t),setTimeout(()=>{URL.revokeObjectURL(o)},1e3)}export{p as downloadPDF,m as exportToPDF};
