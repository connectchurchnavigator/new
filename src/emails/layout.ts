import { APP_BASE_URL } from "./config";

interface EmailLayoutOptions {
  title: string;
  previewText?: string;
  badge?: {
    text: string;
    bg?: string;
    color?: string;
  };
  contentHtml: string;
  cta?: {
    text: string;
    url: string;
    bg?: string;
  };
  secondaryCta?: {
    text: string;
    url: string;
  };
}

/**
 * Standard, responsive HTML email layout matching ChurchNavigator brand
 * Clean typography, rounded card, header badge, and footer
 */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const { title, previewText, badge, contentHtml, cta, secondaryCta } = options;

  const badgeHtml = badge
    ? `<div style="display:inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${badge.bg || "#f3e8ff"}; color: ${badge.color || "#7c3aed"}; margin-bottom: 12px;">
        ${badge.text}
      </div>`
    : "";

  const ctaHtml = cta
    ? `<div style="margin-top: 28px; text-align: center;">
        <a href="${cta.url}" target="_blank" style="display: inline-block; background-color: ${cta.bg || "#7c3aed"}; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);">
          ${cta.text}
        </a>
        ${
          secondaryCta
            ? `<div style="margin-top: 12px;">
                <a href="${secondaryCta.url}" target="_blank" style="font-size: 13px; color: #64748b; text-decoration: underline; font-weight: 600;">
                  ${secondaryCta.text}
                </a>
              </div>`
            : ""
        }
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${previewText ? `<meta name="description" content="${previewText}">` : ""}
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  ${previewText ? `<div style="display:none; font-size:1px; color:#f8fafc; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">${previewText}</div>` : ""}

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04);">
          
          <!-- Top Brand Header Bar with Official ChurchNavigator Logo -->
          <tr>
            <td style="padding: 26px 32px 22px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${APP_BASE_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img 
                        src="${APP_BASE_URL}/icon.png" 
                        alt="ChurchNavigator" 
                        width="210" 
                        style="display: block; width: 210px; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none; margin: 0 auto;" 
                      />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 32px 32px 28px;">
              ${badgeHtml}
              <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.3;">
                ${title}
              </h1>
              
              <div style="font-size: 14.5px; line-height: 1.6; color: #475569;">
                ${contentHtml}
              </div>

              ${ctaHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <div style="margin-bottom: 8px;">
                <a href="${APP_BASE_URL}" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Church Directory</a> •
                <a href="${APP_BASE_URL}/pastors" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Pastors</a> •
                <a href="${APP_BASE_URL}/events" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Events</a>
              </div>
              <div>
                © ${new Date().getFullYear()} ChurchNavigator. Connecting believers, ministries, and community.
              </div>
              <div style="margin-top: 4px; font-size: 11px; color: #cbd5e1;">
                This automated notification was generated by ChurchNavigator.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
