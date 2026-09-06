const axios = require('axios');

/**
 * Formats a raw phone string to E.164 numeric digits.
 * 10-digit Indian numbers are prefixed with '91'.
 *
 * @param {string} phoneStr - Raw phone number string.
 * @returns {string|null} Formatted digits or null if invalid.
 */
function formatPhoneNumber(phoneStr) {
  if (!phoneStr) return null;
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length >= 11) return digits;
  return null;
}

/**
 * Masks an access token for safe logging — shows only the first 8 characters.
 *
 * @param {string} token
 * @returns {string}
 */
function maskToken(token) {
  if (!token || token.length < 8) return '***';
  return token.substring(0, 8) + '***[MASKED]';
}

/**
 * Sends a WhatsApp notification using the approved Meta template
 * (booking_notification) to both configured admin numbers after a
 * booking is successfully saved in MongoDB.
 *
 * Template variable order:
 *   {{1}} Booking ID
 *   {{2}} Customer Name
 *   {{3}} Customer Phone Number
 *   {{4}} Vehicle Name
 *   {{5}} Pickup Location
 *   {{6}} Drop Location
 *   {{7}} Travel Date
 *   {{8}} Pickup Time
 *   {{9}} Estimated Fare
 *
 * @param {Object} booking - Populated Mongoose Booking document.
 * @returns {Promise<void>}
 */
async function sendBookingNotification(booking) {
  // ── 1. Read all required values from environment variables ──────────────
  const token        = process.env.WHATSAPP_TOKEN;
  const phoneId      = process.env.PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'booking_notification';
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US';
  const number1      = process.env.WHATSAPP_NUMBER_1;
  const number2      = process.env.WHATSAPP_NUMBER_2;

  // ── 2. Validate required configuration ─────────────────────────────────
  if (!token || !phoneId) {
    console.error('[WhatsApp] ❌ Missing WHATSAPP_TOKEN or PHONE_NUMBER_ID in .env. Notification aborted.');
    return;
  }
  if (!number1 && !number2) {
    console.error('[WhatsApp] ❌ No admin numbers configured (WHATSAPP_NUMBER_1 / WHATSAPP_NUMBER_2). Notification aborted.');
    return;
  }

  // ── 3. Extract and sanitise booking fields (fallback to "N/A") ──────────
  const bookingId    = booking.bookingId                                || 'N/A';
  const customerName = booking.customerName                             || 'N/A';
  const customerPhone= booking.phone                                    || 'N/A';
  const vehicleName  = (booking.vehicle && booking.vehicle.name)
                       ? booking.vehicle.name                           : 'N/A';
  const pickup       = booking.pickup                                   || 'N/A';
  const drop         = booking.drop                                     || 'N/A';
  const travelDate   = booking.date                                     || 'N/A';
  const pickupTime   = booking.time                                     || 'N/A';
  const estimatedFare= (booking.estimatedFare !== undefined && booking.estimatedFare !== null)
                       ? Number(booking.estimatedFare).toLocaleString('en-IN')
                       : 'N/A';

  // ── 4. Build the template component parameters (must match approved order) ──
  const templateParameters = [
    { type: 'text', text: bookingId },      // {{1}}
    { type: 'text', text: customerName },   // {{2}}
    { type: 'text', text: customerPhone },  // {{3}}
    { type: 'text', text: vehicleName },    // {{4}}
    { type: 'text', text: pickup },         // {{5}}
    { type: 'text', text: drop },           // {{6}}
    { type: 'text', text: travelDate },     // {{7}}
    { type: 'text', text: pickupTime },     // {{8}}
    { type: 'text', text: estimatedFare },  // {{9}}
  ];

  // ── 5. Resolve and de-duplicate admin recipient numbers ─────────────────
  const rawNumbers = [number1, number2].filter(Boolean);
  const adminNumbers = [];
  for (const raw of rawNumbers) {
    const formatted = formatPhoneNumber(raw);
    if (formatted && !adminNumbers.includes(formatted)) {
      adminNumbers.push(formatted);
    }
  }

  if (adminNumbers.length === 0) {
    console.error('[WhatsApp] ❌ No valid admin numbers after formatting. Notification aborted.');
    return;
  }

  // ── 6. Build the formatted text message body ────────────────────────────
  const messageBody =
`🚖 *Rider Tours — New Booking Alert* 🚖

A new booking has been received.

*Booking ID:* ${bookingId}
*Customer Name:* ${customerName}
*Customer Phone:* ${customerPhone}
*Vehicle:* ${vehicleName}
*Pickup Location:* ${pickup}
*Drop Location:* ${drop}
*Travel Date:* ${travelDate}
*Pickup Time:* ${pickupTime}
*Estimated Fare:* ₹${estimatedFare}

Please check the Rider Tours admin dashboard for complete booking details.`;

  // ── 7. Meta Graph API endpoint ───────────────────────────────────────────
  const apiUrl = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  // ── 8. Send to each admin number independently ───────────────────────────
  for (const recipient of adminNumbers) {

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type:    'individual',
      to:                recipient,
      type:              'text',
      text: {
        preview_url: false,
        body:        messageBody,
      },
    };

    // ── Pre-send log (token masked for security) ──────────────────────────
    console.log('[WhatsApp] ──────────────────────────────────────────────');
    console.log(`[WhatsApp] 📤 Sending booking notification`);
    console.log(`[WhatsApp]    Recipient    : ${recipient}`);
    console.log(`[WhatsApp]    Booking ID   : ${bookingId}`);
    console.log(`[WhatsApp]    Graph API URL: ${apiUrl}`);
    console.log(`[WhatsApp]    Auth Header  : Bearer ${maskToken(token)}`);
    console.log(`[WhatsApp]    Message      :\n${messageBody}`);

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });

      const msgId     = response.data?.messages?.[0]?.id || 'N/A';
      const msgStatus = response.data?.messages?.[0]?.message_status || 'N/A';
      console.log(`[WhatsApp] ✅ Message accepted`);
      console.log(`[WhatsApp]    HTTP Status : ${response.status}`);
      console.log(`[WhatsApp]    Message ID  : ${msgId}`);
      console.log(`[WhatsApp]    Msg Status  : ${msgStatus}`);
      console.log('[WhatsApp]    Full Response:', JSON.stringify(response.data, null, 2));

    } catch (err) {
      const status   = err.response?.status || 'N/A';
      const errBody  = err.response?.data   || {};
      const errCode  = errBody?.error?.code                          || 'N/A';
      const errMsg   = errBody?.error?.message                       || err.message;

      console.error(`[WhatsApp] ❌ Failed to send to ${recipient}`);
      console.error(`[WhatsApp]    HTTP Status   : ${status}`);
      console.error(`[WhatsApp]    Meta Error Code: ${errCode}`);
      console.error(`[WhatsApp]    Meta Error Msg : ${errMsg}`);
      console.error('[WhatsApp]    Full Error Body:', JSON.stringify(errBody, null, 2));
      // NOTE: Error is intentionally NOT re-thrown so the booking remains saved
      //       and the customer flow is completely unaffected.
    }

    console.log('[WhatsApp] ──────────────────────────────────────────────');
  }
}

module.exports = { sendBookingNotification };
