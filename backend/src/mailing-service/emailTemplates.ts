export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Verify Your Email - Samsar ProMax</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#667eea" style="background-color: #667eea; padding: 40px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 48px; line-height: 1;">&#127968;</td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; font-family: Arial, Helvetica, sans-serif;">Samsar ProMax</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <p style="margin: 0; font-size: 16px; color: #e8e8ff; font-family: Arial, Helvetica, sans-serif;">Verify Your Email Address</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 16px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding-bottom: 20px;">
                    Hello there! &#128075;
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding-bottom: 30px;">
                    Thank you for signing up with <strong style="color: #667eea;">Samsar ProMax</strong>! Use the verification code below to complete your registration:
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 25px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#667eea" style="background-color: #667eea; border-radius: 8px; padding: 20px 40px;">
                          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff; font-family: Arial, Helvetica, sans-serif;">{verificationCode}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 25px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9ff; border-left: 4px solid #667eea;">
                      <tr>
                        <td style="padding: 15px 20px; font-size: 14px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
                          &#9200; This code will expire in <strong>15 minutes</strong> for security reasons.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #888888; font-family: Arial, Helvetica, sans-serif; padding-top: 10px;">
                    If you didn't create an account with us, you can safely ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#f8f9ff" style="background-color: #f8f9ff; padding: 25px 30px; border-top: 1px solid #eeeeee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 14px; font-weight: 600; color: #667eea; font-family: Arial, Helvetica, sans-serif; padding-bottom: 10px;">
                    Samsar ProMax Team
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 12px; color: #999999; font-family: Arial, Helvetica, sans-serif;">
                    This is an automated message, please do not reply to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Welcome to Samsar ProMax</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#667eea" style="background-color: #667eea; padding: 50px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 60px; line-height: 1;">&#127881;</td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 600; color: #ffffff; font-family: Arial, Helvetica, sans-serif;">Welcome to Samsar ProMax!</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <p style="margin: 0; font-size: 16px; color: #e8e8ff; font-family: Arial, Helvetica, sans-serif;">Your journey to finding the perfect home starts here</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 18px; color: #333333; font-family: Arial, Helvetica, sans-serif; padding-bottom: 25px;">
                    Hi <strong style="color: #667eea;">{userName}</strong>! &#128075;
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding-bottom: 25px;">
                    We're thrilled to have you join the <strong>Samsar ProMax</strong> family! You've just unlocked access to the best real estate platform in town.
                  </td>
                </tr>
                <!-- Features Box -->
                <tr>
                  <td style="padding: 25px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f8f9ff" style="background-color: #f8f9ff; border-radius: 8px;">
                      <tr>
                        <td style="padding: 25px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="font-size: 16px; font-weight: 600; color: #667eea; font-family: Arial, Helvetica, sans-serif; padding-bottom: 15px;">
                                &#128640; What you can do now:
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 15px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding: 8px 0;">
                                <span style="color: #667eea; font-weight: bold;">&#10003;</span> &nbsp; Browse thousands of property listings
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 15px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding: 8px 0;">
                                <span style="color: #667eea; font-weight: bold;">&#10003;</span> &nbsp; Save your favorite homes
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 15px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding: 8px 0;">
                                <span style="color: #667eea; font-weight: bold;">&#10003;</span> &nbsp; List your own properties
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 15px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding: 8px 0;">
                                <span style="color: #667eea; font-weight: bold;">&#10003;</span> &nbsp; Connect with property owners
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 25px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#667eea" style="background-color: #667eea; border-radius: 30px;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="50%" strokecolor="#667eea" fillcolor="#667eea">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Start Exploring &#127968;</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="#" style="display: inline-block; padding: 15px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; font-family: Arial, Helvetica, sans-serif;">Start Exploring &#127968;</a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 14px; color: #888888; font-family: Arial, Helvetica, sans-serif; padding-top: 15px;">
                    Need help? Contact us at <a href="mailto:support@samsarpromax.com" style="color: #667eea; text-decoration: none;">support@samsarpromax.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#f8f9ff" style="background-color: #f8f9ff; padding: 25px 30px; border-top: 1px solid #eeeeee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 14px; font-weight: 600; color: #667eea; font-family: Arial, Helvetica, sans-serif; padding-bottom: 10px;">
                    The Samsar ProMax Team
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 12px; color: #999999; font-family: Arial, Helvetica, sans-serif; padding-bottom: 10px;">
                    Ariana - Rue Raoued - Technopole El Ghazala
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 11px; color: #bbbbbb; font-family: Arial, Helvetica, sans-serif;">
                    &copy; 2025 Samsar ProMax. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const PASSWORD_RESET_OTP_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Reset Your Password - Samsar ProMax</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#667eea" style="background-color: #667eea; padding: 40px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 48px; line-height: 1;">&#128272;</td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; font-family: Arial, Helvetica, sans-serif;">Samsar ProMax</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <p style="margin: 0; font-size: 16px; color: #e8e8ff; font-family: Arial, Helvetica, sans-serif;">Password Reset Request</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 16px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding-bottom: 20px;">
                    Hello {userName}! &#128075;
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding-bottom: 25px;">
                    We received a request to reset your password. Use the OTP code below to proceed with resetting your password:
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 25px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#667eea" style="background-color: #667eea; border-radius: 8px; padding: 20px 40px;">
                          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff; font-family: Arial, Helvetica, sans-serif;">{otpCode}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Security Warning -->
                <tr>
                  <td style="padding: 15px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff5f5; border-left: 4px solid #e74c3c;">
                      <tr>
                        <td style="padding: 15px 20px; font-size: 14px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
                          &#9888;&#65039; <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support immediately.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Expiry Notice -->
                <tr>
                  <td style="padding: 15px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9ff; border-left: 4px solid #667eea;">
                      <tr>
                        <td style="padding: 15px 20px; font-size: 14px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
                          &#9200; This code will expire in <strong>15 minutes</strong> for security reasons.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#f8f9ff" style="background-color: #f8f9ff; padding: 25px 30px; border-top: 1px solid #eeeeee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 14px; font-weight: 600; color: #667eea; font-family: Arial, Helvetica, sans-serif; padding-bottom: 10px;">
                    Samsar ProMax Team
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 12px; color: #999999; font-family: Arial, Helvetica, sans-serif;">
                    This is an automated message, please do not reply to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Password Reset Successful - Samsar ProMax</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#667eea" style="background-color: #667eea; padding: 40px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 48px; line-height: 1;">&#9989;</td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; font-family: Arial, Helvetica, sans-serif;">Samsar ProMax</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <p style="margin: 0; font-size: 16px; color: #e8e8ff; font-family: Arial, Helvetica, sans-serif;">Password Reset Successful</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 16px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding-bottom: 20px;">
                    Hello {userName}! &#128075;
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding-bottom: 25px;">
                    Great news! Your password has been successfully reset. You can now log in to your account with your new password.
                  </td>
                </tr>
                <!-- Success Icon -->
                <tr>
                  <td align="center" style="padding: 25px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#28a745" style="background-color: #28a745; border-radius: 50px; width: 80px; height: 80px;">
                          <span style="font-size: 40px; color: #ffffff; line-height: 80px;">&#10003;</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Security Tips -->
                <tr>
                  <td style="padding: 25px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f8f9ff" style="background-color: #f8f9ff; border-radius: 8px;">
                      <tr>
                        <td style="padding: 25px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="font-size: 16px; font-weight: 600; color: #667eea; font-family: Arial, Helvetica, sans-serif; padding-bottom: 15px;">
                                &#128737;&#65039; Security Tips:
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 15px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding: 8px 0;">
                                <span style="color: #667eea;">&#8226;</span> &nbsp; Use a strong, unique password
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 15px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding: 8px 0;">
                                <span style="color: #667eea;">&#8226;</span> &nbsp; Enable two-factor authentication if available
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 15px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding: 8px 0;">
                                <span style="color: #667eea;">&#8226;</span> &nbsp; Avoid using the same password across multiple sites
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 15px; color: #555555; font-family: Arial, Helvetica, sans-serif; padding: 8px 0;">
                                <span style="color: #667eea;">&#8226;</span> &nbsp; Never share your password with anyone
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Warning -->
                <tr>
                  <td style="padding: 15px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff5f5; border-left: 4px solid #e74c3c;">
                      <tr>
                        <td style="padding: 15px 20px; font-size: 14px; color: #555555; font-family: Arial, Helvetica, sans-serif;">
                          &#9888;&#65039; If you did not initiate this password reset, please contact our support team immediately.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 25px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#667eea" style="background-color: #667eea; border-radius: 30px;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:50px;v-text-anchor:middle;width:180px;" arcsize="50%" strokecolor="#667eea" fillcolor="#667eea">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Sign In Now &#128273;</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="#" style="display: inline-block; padding: 15px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; font-family: Arial, Helvetica, sans-serif;">Sign In Now &#128273;</a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#f8f9ff" style="background-color: #f8f9ff; padding: 25px 30px; border-top: 1px solid #eeeeee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 14px; font-weight: 600; color: #667eea; font-family: Arial, Helvetica, sans-serif; padding-bottom: 10px;">
                    Samsar ProMax Team
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 12px; color: #999999; font-family: Arial, Helvetica, sans-serif;">
                    This is an automated message, please do not reply to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
