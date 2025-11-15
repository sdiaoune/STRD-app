### Forgotten Passwords: operational notes

- Rate limits (Supabase Auth defaults):
  - Password reset requests (`/auth/v1/recover`): 1/min per user IP by default. Consider tightening if abused.
  - OTP/links email send quotas depend on SMTP provider. Supabase inbuilt SMTP has low limits; use a custom SMTP for production.

- CAPTCHA (recommended):
  - Enable CAPTCHA on recover endpoints in Supabase Dashboard → Authentication → Rate limits & CAPTCHA. This mitigates scripted abuse of the reset form.

- SMTP deliverability:
  - Configure a custom SMTP (SendGrid/SES/etc) in Dashboard → Authentication → Email. Use a domain your users trust.
  - Disable link tracking in your SMTP provider to avoid breaking single-use links.

- Email template (reset password):
  - Use PKCE-style link to avoid scanners consuming tokens. Example:
    ```html
    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=strd://reset-password">
      Reset Password
    </a>
    ```
  - If you later use `redirectTo` in the API call, swap `{{ .SiteURL }}` for `{{ .RedirectTo }}`.

- URL allow list:
  - Set Site URL to your web base (e.g., `https://app.example.com`).
  - Add Additional Redirect URLs: `strd://**` and local dev web origins.



