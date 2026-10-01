# ChurchNavigator - Supabase Email Template & SMTP Setup Guide

This guide details how to configure Supabase Authentication emails to match the official **ChurchNavigator design system** used in [`src/emails/`](file:///c:/Users/DELL/Downloads/chruch/src/emails), why emails previously arrived as generic Supabase testing emails, and how SMTP credentials work.

---

## 1. Where to Find SMTP Credentials (Host, Port, Username, Password)

By default, every Supabase project uses a shared test mailer (`noreply@mail.app.supabase.io`) capped at **3 emails per hour**. To send emails from your own domain (`notifications@churchnavigator.com` or `hello@churchnavigator.com`), you must configure custom SMTP in Supabase.

### Recommended Provider: **Resend** (Already used in the codebase)
The app is configured to use [Resend](https://resend.com) via `RESEND_API_KEY` in [src/emails/config.ts](file:///c:/Users/DELL/Downloads/chruch/src/emails/config.ts).

1. Log in to [resend.com](https://resend.com).
2. Go to **Domains** -> Ensure `churchnavigator.com` (or your domain) is verified with DNS records.
3. Go to **API Keys** -> Click **Create API Key** (Permissions: Sending access). Copy the generated key (starts with `re_...`).
4. In your **[Supabase Project Dashboard](https://supabase.com/dashboard)**:
   - Navigate to **Project Settings** (gear icon) ➔ **Authentication** ➔ scroll down to **SMTP Settings**.
   - Toggle **Enable Custom SMTP** on.
   - Fill in:
     - **Sender email**: `notifications@churchnavigator.com` *(must match a verified domain in Resend)*
     - **Sender name**: `ChurchNavigator`
     - **Host**: `smtp.resend.com`
     - **Port**: `465` (or `587`)
     - **Username**: `resend` *(literally the text string `resend`)*
     - **Password**: Your Resend API key (`re_xxxxxxxxxxxxxxxxx`)
     - Check **Save**.

### Other Popular Providers:

| Provider | Host | Port | Username | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Resend** *(Project Standard)* | `smtp.resend.com` | `465` or `587` | `resend` | Your Resend API Key (`re_...`) |
| **Brevo** (Sendinblue) | `smtp-relay.brevo.com` | `587` | Your Brevo account email | Generated SMTP Key |
| **SendGrid** | `smtp.sendgrid.net` | `587` | `apikey` | SendGrid API Key (`SG...`) |
| **Google Workspace / Gmail** | `smtp.gmail.com` | `465` or `587` | Your full Gmail address | 16-character Google App Password |

---

## 2. Branded HTML Email Templates for Supabase Auth

These templates are matched pixel-for-pixel to the ChurchNavigator email layout system ([`renderEmailLayout` in `src/emails/layout.ts`](file:///c:/Users/DELL/Downloads/chruch/src/emails/layout.ts)) with:
- Centered ChurchNavigator logo header
- Purple badge (`#f3e8ff` background, `#7c3aed` text)
- 20px rounded card with smooth borders and subtle shadow
- Bold purple CTA button (`#7c3aed`) with drop shadow
- Clean footer with directory navigation links

---

### Template A: Confirm Signup (Email Confirmation)

In **Supabase Dashboard** ➔ **Authentication** ➔ **Email Templates** ➔ **Confirm signup**:

**Subject:**
```text
Confirm your email for ChurchNavigator ⛪
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your ChurchNavigator Account</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04);">
          
          <!-- Brand Header Bar -->
          <tr>
            <td style="padding: 26px 32px 22px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <a href="{{ .SiteURL }}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img 
                  src="{{ .SiteURL }}/icon.png" 
                  alt="ChurchNavigator" 
                  width="210" 
                  style="display: block; width: 210px; max-width: 100%; height: auto; border: 0; outline: none; margin: 0 auto;" 
                />
              </a>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 32px 32px 28px;">
              <!-- Badge -->
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background-color: #f3e8ff; color: #7c3aed; margin-bottom: 12px;">
                Account Verification
              </div>

              <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.3;">
                Confirm your email address
              </h1>
              
              <div style="font-size: 14.5px; line-height: 1.6; color: #475569;">
                <p style="margin: 0 0 16px;">
                  Welcome to <strong>ChurchNavigator</strong>! Thank you for joining our community connecting believers, ministries, and faith leaders.
                </p>
                <p style="margin: 0 0 20px;">
                  Please confirm your email address to activate your account and access your dashboard.
                </p>

                <!-- Confirmation Box -->
                <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px;">
                  <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;">Account Email</div>
                  <div style="font-size: 15px; font-weight: 800; color: #0f172a;">{{ .Email }}</div>
                </div>

                <!-- Call to Action Button -->
                <div style="margin-top: 28px; text-align: center;">
                  <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.28); letter-spacing: 0.02em;">
                    Verify &amp; Continue &rarr;
                  </a>
                </div>

                <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
                  <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8;">
                    If the button above does not work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; font-size: 12px; word-break: break-all; color: #7c3aed;">
                    <a href="{{ .ConfirmationURL }}" style="color: #7c3aed; text-decoration: underline;">{{ .ConfirmationURL }}</a>
                  </p>
                </div>

                <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8;">
                  If you did not sign up for ChurchNavigator, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <div style="margin-bottom: 8px;">
                <a href="{{ .SiteURL }}" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Church Directory</a> •
                <a href="{{ .SiteURL }}/pastors" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Pastors</a> •
                <a href="{{ .SiteURL }}/events" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Events</a>
              </div>
              <div>
                © {{ .Year }} ChurchNavigator. Connecting believers, ministries, and community.
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
</html>
```

---

### Template B: Reset Password

In **Supabase Dashboard** ➔ **Authentication** ➔ **Email Templates** ➔ **Reset password**:

**Subject:**
```text
Reset your ChurchNavigator password 🔐
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your ChurchNavigator Password</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04);">
          
          <!-- Brand Header Bar -->
          <tr>
            <td style="padding: 26px 32px 22px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <a href="{{ .SiteURL }}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img 
                  src="{{ .SiteURL }}/icon.png" 
                  alt="ChurchNavigator" 
                  width="210" 
                  style="display: block; width: 210px; max-width: 100%; height: auto; border: 0; outline: none; margin: 0 auto;" 
                />
              </a>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 32px 32px 28px;">
              <!-- Badge -->
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background-color: #fee2e2; color: #b91c1c; margin-bottom: 12px;">
                Security Request
              </div>

              <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.3;">
                Reset your password
              </h1>
              
              <div style="font-size: 14.5px; line-height: 1.6; color: #475569;">
                <p style="margin: 0 0 16px;">
                  We received a request to reset the password for your ChurchNavigator account associated with <strong>{{ .Email }}</strong>.
                </p>
                <p style="margin: 0 0 20px;">
                  Click the button below to choose a new password. This link is valid for 1 hour.
                </p>

                <!-- Call to Action Button -->
                <div style="margin-top: 28px; text-align: center;">
                  <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.28); letter-spacing: 0.02em;">
                    Reset My Password &rarr;
                  </a>
                </div>

                <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
                  <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8;">
                    If the button does not work, copy and paste this URL into your browser:
                  </p>
                  <p style="margin: 0; font-size: 12px; word-break: break-all; color: #7c3aed;">
                    <a href="{{ .ConfirmationURL }}" style="color: #7c3aed; text-decoration: underline;">{{ .ConfirmationURL }}</a>
                  </p>
                </div>

                <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8;">
                  If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <div style="margin-bottom: 8px;">
                <a href="{{ .SiteURL }}" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Church Directory</a> •
                <a href="{{ .SiteURL }}/pastors" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Pastors</a> •
                <a href="{{ .SiteURL }}/events" style="color: #7c3aed; text-decoration: none; font-weight: 700; margin: 0 8px;">Events</a>
              </div>
              <div>
                © {{ .Year }} ChurchNavigator. Connecting believers, ministries, and community.
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
</html>
```

---

## 3. Why Confirmation Previously Showed "Sign In Again" & How It's Handled

### Problem:
1. When a user clicks the confirmation email link, Supabase redirects them back to the app with a token (`code` or `token_hash`).
2. If redirected directly to a protected page (e.g. `/add-church` or `/dashboard`) without first exchanging that token into an authenticated browser cookie session, the route guard detects no session and immediately forces the user to the `/login` screen.

### Solution Configured in Code:
1. **Redirect Parameter**: [src/app/login/page.tsx](file:///c:/Users/DELL/Downloads/chruch/src/app/login/page.tsx) points confirmation redirects to `/auth/callback`:
   ```ts
   `${origin}/auth/callback?next=/add-church`
   ```
2. **Auth Callback Route ([src/app/auth/callback/route.ts](file:///c:/Users/DELL/Downloads/chruch/src/app/auth/callback/route.ts))**:
   - Exchanges PKCE `code` or `token_hash` (`supabase.auth.verifyOtp({ type, token_hash })`).
   - Persists the authentication cookies in the browser.
   - Redirects the user directly to their intended page (`/add-church` or `/dashboard`) logged in.

---

## 4. Supabase URL Configuration Checklist

In **Supabase Dashboard** ➔ **Authentication** ➔ **URL Configuration**:

1. **Site URL**:
   - Set to your primary production domain: `https://churchnavigator.com` (or `http://localhost:3000` during local development).
2. **Redirect URLs** (Ensure all applicable patterns are added):
   - `http://localhost:3000/**`
   - `https://churchnavigator.com/**`
   - `https://*.vercel.app/**` (for preview deployments)
