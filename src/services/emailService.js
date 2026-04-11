const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
}

async function sendConfirmationEmail(email, confirmToken, unsubscribeToken) {
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: '"Release Notifier" <noreply@releasenotifier.dev>',
    to: email,
    subject: 'Confirm your subscription',
    text: `Please confirm your subscription: /api/confirm/${confirmToken}\n\nTo unsubscribe at any time: /api/unsubscribe/${unsubscribeToken}`,
  });

  console.log('Confirmation email preview: ' + nodemailer.getTestMessageUrl(info));
}

async function sendReleaseNotification(email, repo, tagName) {
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: '"Release Notifier" <noreply@releasenotifier.dev>',
    to: email,
    subject: `New release: ${repo} ${tagName}`,
    text: `A new release is available for ${repo}: ${tagName}`,
  });

  console.log('Release notification preview: ' + nodemailer.getTestMessageUrl(info));
}

module.exports = { sendConfirmationEmail, sendReleaseNotification };
