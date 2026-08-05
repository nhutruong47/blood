export function generateCertificate(
  userName: string,
  totalDonations: number,
  bloodType: string
) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Donation Certificate</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #f4f4f5;
          margin: 0;
          padding: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          -webkit-print-color-adjust: exact;
        }
        .certificate {
          background-color: white;
          width: 800px;
          padding: 60px;
          text-align: center;
          border: 15px solid #dc2626;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          position: relative;
        }
        .header {
          color: #dc2626;
          font-size: 42px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: 2px;
        }
        .subtitle {
          font-size: 20px;
          color: #64748b;
          margin-bottom: 40px;
        }
        .name {
          font-size: 48px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 30px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          display: inline-block;
          min-width: 400px;
        }
        .stats {
          font-size: 24px;
          color: #334155;
          margin-bottom: 50px;
          line-height: 1.6;
        }
        .highlight {
          color: #dc2626;
          font-weight: bold;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 60px;
        }
        .signature-line {
          width: 250px;
          border-top: 1px solid #94a3b8;
          padding-top: 10px;
          color: #64748b;
          font-size: 16px;
        }
        .seal {
          width: 120px;
          height: 120px;
          border: 4px solid #dc2626;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #dc2626;
          font-weight: bold;
          font-size: 18px;
          text-transform: uppercase;
          transform: rotate(-15deg);
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
            margin: 0;
          }
          .certificate {
            box-shadow: none;
            width: 100%;
            height: 100vh;
            border-width: 20px;
            box-sizing: border-box;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">Certificate of Appreciation</div>
        <div class="subtitle">THIS CERTIFICATE IS PROUDLY PRESENTED TO</div>
        <div class="name">${userName}</div>
        <div class="stats">
          For your outstanding contribution of <span class="highlight">${totalDonations}</span> blood donations.<br/>
          Your <span class="highlight">${bloodType}</span> blood has helped save countless lives.<br/>
          Thank you for being a hero!
        </div>
        <div class="footer">
          <div class="signature-line">
            Director, Blood Donation Center
          </div>
          <div class="seal">
            Official<br/>Seal
          </div>
          <div class="signature-line">
            ${new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
