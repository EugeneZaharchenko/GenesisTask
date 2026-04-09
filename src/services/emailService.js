function sendConfirmationEmail(email, token) {
  console.log(`[EMAIL] Confirmation email to ${email}: /api/confirm/${token}`);
}

function sendReleaseNotification(email, repo, tagName) {
  console.log(`[EMAIL] Release notification to ${email}: ${repo} — new release ${tagName}`);
}

module.exports = { sendConfirmationEmail, sendReleaseNotification };
