const cron = require('node-cron');
const nodemailer = require('nodemailer');
const db = require('../db');

// Setup mock transporter (in production use real SMTP like SendGrid/AWS SES)
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'windows'
});

const startCronJobs = () => {
  // Run daily at 08:00 AM (0 8 * * *)
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily license expiry check...');
    
    try {
      const promisePool = db.promise();
      const [drivers] = await promisePool.query('SELECT name, license_no, license_expiry FROM drivers WHERE status != ?', ['Retired']);
      
      const expiringDrivers = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      drivers.forEach(d => {
        const expiry = new Date(d.license_expiry);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30 && diffDays >= 0) {
          expiringDrivers.push({ ...d, daysLeft: diffDays });
        } else if (diffDays < 0) {
          expiringDrivers.push({ ...d, daysLeft: diffDays, expired: true });
        }
      });

      if (expiringDrivers.length > 0) {
        let emailText = `Fleet Manager Warning: The following driver licenses are expiring soon or have expired:\n\n`;
        expiringDrivers.forEach(d => {
          if (d.expired) {
            emailText += `[EXPIRED] ${d.name} (${d.license_no}) - Expired ${Math.abs(d.daysLeft)} days ago!\n`;
          } else {
            emailText += `[WARNING] ${d.name} (${d.license_no}) - Expires in ${d.daysLeft} days.\n`;
          }
        });

        // Send mock email
        const info = await transporter.sendMail({
          from: '"TransitOps System" <alerts@transitops.local>',
          to: 'fleetmanager@example.com',
          subject: '🚨 Driver License Expiry Alert',
          text: emailText
        });

        console.log('[CRON] Alert email dispatched successfully:');
        console.log(info.message.toString());
      } else {
        console.log('[CRON] No licenses expiring within 30 days. No email sent.');
      }
    } catch (err) {
      console.error('[CRON] Error checking license expiries:', err);
    }
  });
  
  console.log('[SYSTEM] Background cron jobs initialized (Daily at 08:00 AM).');
};

module.exports = { startCronJobs };
