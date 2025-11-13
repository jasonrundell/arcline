# Twilio Setup Guide

This guide covers setting up Twilio ConversationRelay for ARCline hotlines.

## Prerequisites

- Twilio account (sign up at [twilio.com](https://www.twilio.com))
- Phone numbers purchased in Twilio (or use trial numbers for testing)
- Webhook URL from your deployed application

## Step 1: Purchase Phone Number

1. Go to [Twilio Console > Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/search)
2. Purchase **one phone number** for all hotlines
3. The system uses an interactive voice menu - users press 1-5 to select their option:
   - Press 1: Extraction Request
   - Press 2: Loot Locator
   - Press 3: Scrappy's Chicken Line
   - Press 4: Faction News
   - Press 5: Event Alarm

## Step 2: Configure ConversationRelay

### Option A: Using Twilio Console

1. Go to [Twilio Console > Conversations](https://console.twilio.com/us1/develop/conversations)
2. Create a new Conversation Service
3. Configure ConversationRelay:
   - Set webhook URL: `https://your-domain.vercel.app/api/twilio/conversation/webhook`
   - Method: POST
   - Enable ConversationRelay

### Option B: Using Twilio API

```bash
# Create Conversation Service
curl -X POST https://conversations.twilio.com/v1/Services \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
  -d "FriendlyName=ARCline Hotlines"

# Configure webhook (replace SERVICE_SID and WEBHOOK_URL)
curl -X POST https://conversations.twilio.com/v1/Services/SERVICE_SID/Configuration \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
  -d "WebhookUrl=WEBHOOK_URL"
```

## Step 3: Configure Phone Number

1. Go to Phone Numbers > Manage > Active Numbers
2. Click on your phone number
3. Configure:
   - **Voice & Fax**: Set to your Conversation Service
   - **A MESSAGE COMES IN**: Leave blank (handled by ConversationRelay)
   - **A CALL COMES IN**: Set to your Conversation Service

**Note**: Only one phone number is needed. The webhook handler presents a menu when users call.

## Step 4: Set Up ConversationRelay Webhook

Your webhook endpoint is:

```
POST /api/twilio/conversation/webhook
```

The endpoint expects form data with:

- `ConversationSid`
- `CurrentInput`
- `CurrentInputType`
- `Memory`
- `CurrentTask` (optional)

## Step 5: Testing

### Test with Twilio Console

1. Use the [Twilio Console Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/active) to test
2. Call your phone number
3. Check webhook logs in Vercel
4. Verify responses in Twilio logs

### Test with ngrok (Local Development)

1. Start ngrok:

   ```bash
   ngrok http 3000
   ```

2. Update webhook URL in Twilio to ngrok URL:

   ```
   https://your-ngrok-url.ngrok.io/api/twilio/conversation/webhook
   ```

3. Make test calls

## Step 6: Environment Variables

Add to your `.env.local`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+18722825463
```

**Note**: Only one phone number is needed. Users select options via the voice menu (1-5).

## Troubleshooting

### Webhook Not Receiving Requests

- Verify webhook URL is accessible (test with curl)
- Check Twilio webhook logs in Console
- Ensure HTTPS is used (required for production)

### ConversationRelay Not Responding

- Check webhook response format
- Verify JSON structure matches expected format
- Check Twilio logs for errors

### Phone Number Not Working

- Verify phone number is active in Twilio
- Check phone number configuration
- Ensure Conversation Service is linked

## Advanced Configuration

### Custom Voice Prompts

Modify hotline handlers in `lib/hotlines/` to customize voice prompts.

### Multi-language Support

Add language detection and routing in webhook handler.

### Analytics

Use Twilio Insights to track:

- Call volume
- Response times
- Error rates

## Resources

- [Twilio ConversationRelay Documentation](https://www.twilio.com/docs/conversations/conversation-relay)
- [Twilio API Reference](https://www.twilio.com/docs/voice/api)
- [Webhook Security Best Practices](https://www.twilio.com/docs/usage/webhooks/webhooks-security)
