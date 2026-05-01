export function printElement(elementId: string, title: string) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; }
    th { background: #f3f4f6; text-align: left; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .text-xs { font-size: 11px; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .text-lg { font-size: 16px; }
    .text-base { font-size: 14px; }
    .italic { font-style: italic; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .border-box { border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; }
    .sig-line { border-top: 1px solid #ccc; padding-top: 8px; color: #9ca3af; font-size: 11px; }
    .uppercase { text-transform: uppercase; font-size: 10px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
    .section-title { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; }
    @page { margin: 15mm; }
  </style>
</head>
<body>${el.innerHTML}</body>
</html>`);

  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 300);
}
