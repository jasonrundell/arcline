# API Documentation

## Twilio ConversationRelay Webhook

### Endpoint

```
POST /api/twilio/conversation/webhook
```

### Description

Handles incoming Twilio ConversationRelay requests and routes them to the appropriate hotline handler.

### Request Format

Twilio sends form data with the following fields:

- `ConversationSid` (string): Unique identifier for the conversation
- `CurrentInput` (string): User's current input (voice or text)
- `CurrentInputType` (string): Type of input ('text' or 'voice')
- `Memory` (string): JSON string containing conversation memory
- `CurrentTask` (string, optional): Current task identifier

### Response Format

Returns a JSON object with the following structure:

```json
{
  "actions": [
    {
      "say": "Message to speak to user",
      "listen": true,
      "remember": {
        "key": "value"
      },
      "handoff": {
        "channel": "voice",
        "uri": "https://..."
      }
    }
  ]
}
```

### Action Properties

- `say` (string, optional): Text to speak to the user
- `listen` (boolean, optional): Whether to continue listening for input
- `remember` (object, optional): Key-value pairs to store in conversation memory
- `handoff` (object, optional): Handoff configuration for advanced routing

### Hotline Types

The webhook routes requests based on the `hotlineType` stored in memory:

1. **extraction** - Extraction Request Hotline
2. **loot** - Loot Locator Hotline
3. **chicken** - Scrappy's Chicken Line
4. **gossip** - Faction Gossip Line
5. **alarm** - Wake-Up Call / Raid Alarm

### Example Request

```bash
curl -X POST https://your-domain.com/api/twilio/conversation/webhook \
  -d "ConversationSid=CH123" \
  -d "CurrentInput=Hello" \
  -d "CurrentInputType=text" \
  -d "Memory={\"hotlineType\":\"extraction\"}"
```

### Example Response

```json
{
  "actions": [
    {
      "say": "Welcome to the Extraction Request Hotline. Please provide your location.",
      "listen": true,
      "remember": {
        "hotlineType": "extraction",
        "step": "location"
      }
    }
  ]
}
```

### Error Handling

If an error occurs, the API returns a 500 status with an error message:

```json
{
  "actions": [
    {
      "say": "I'm experiencing technical difficulties. Please try again later.",
      "listen": false
    }
  ]
}
```

## Hotline Handlers

Each hotline has its own handler function in `lib/hotlines/`:

- `extraction.ts` - Handles extraction requests
- `loot.ts` - Handles loot searches
- `chicken.ts` - Handles Scrappy's chicken line
- `gossip.ts` - Handles gossip requests
- `alarm.ts` - Handles alarm setup

Each handler follows a state machine pattern using the `step` field in memory to track conversation flow.

