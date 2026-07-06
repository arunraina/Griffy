export function renderEmailHtml(params: { title: string; body: string; linkUrl?: string }): string {
  const { title, body, linkUrl } = params;

  const button = linkUrl
    ? `<tr><td style="padding:24px 32px 8px;">
         <a href="${linkUrl}" style="display:inline-block;background:#C0593A;color:#FDF8F5;text-decoration:none;
            padding:12px 24px;border-radius:6px;font-family:Georgia,serif;font-size:15px;">
           View on Griffy
         </a>
       </td></tr>`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAEEE9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAEEE9;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#FDF8F5;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:#9E3F24;padding:20px 32px;">
                <span style="color:#FDF8F5;font-family:Georgia,serif;font-size:20px;font-weight:bold;">Griffy</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0;">
                <h1 style="margin:0;font-family:Georgia,serif;font-size:20px;color:#3A2418;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0;">
                <p style="margin:0;font-size:15px;line-height:1.5;color:#5A4436;">${body}</p>
              </td>
            </tr>
            ${button}
            <tr>
              <td style="padding:28px 32px 24px;">
                <p style="margin:0;font-size:12px;color:#9C8B7D;">You're receiving this because you have an account on Griffy.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
