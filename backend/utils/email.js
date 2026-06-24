/**
 * Simulated Email Sender for Development & Demo
 * Logs beautiful email cards to the console to make testing easy without smtp credentials.
 */
const sendEmail = async ({ to, subject, html }) => {
  console.log('\n' + '='.repeat(60));
  console.log(`✉️  EMAIL SENT OUTBOX:`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('-'.repeat(60));
  // Clean up html tags just for nicer console read
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`Content Outline:\n${textContent.slice(0, 300)}...`);
  console.log('='.repeat(60) + '\n');
  return true;
};

module.exports = sendEmail;
