# Voice Switching Limitation in ConversationRelay

## Issue Summary

The voice does not switch between different hotlines during a call session. This is **not a bug in the implementation** but rather a **limitation of Twilio's ConversationRelay service**.

## Root Cause

Twilio ConversationRelay does **not support dynamic voice switching** during an active session. The voice configuration (ttsProvider, voice, language) is set once when the call is initiated via the TwiML response and **cannot be changed mid-call** through WebSocket messages.

### Current Implementation Behavior

1. When a call is initiated, the `/twiml` endpoint is called
2. The voice configuration is set based on the `hotline` query parameter (defaults to "default" if not provided)
3. Once the ConversationRelay WebSocket connection is established, the voice is locked for the entire session
4. When users select different hotlines (press 1-5), the voice remains the same because it was already established

## Official Documentation

According to Twilio's official documentation:

> **"Once the session starts, you can't modify voice and language configurations set in TwiML through WebSocket messages."**

**Reference:** [Twilio ConversationRelay Best Practices](https://www.twilio.com/docs/voice/conversationrelay/best-practices)

Additional references:
- [Voice Configuration in ConversationRelay](https://www.twilio.com/docs/voice/conversationrelay/voice-configuration)
- [Building Voice Bots with ConversationRelay](https://www.twilio.com/en-us/blog/voice-ai-build-voice-bots-conversation-relay)

## Possible Solutions

### Option 1: Use Same Voice for All Hotlines (Current Behavior) ✅

**Pros:**
- Seamless user experience (no call interruption)
- Simple implementation
- No additional Twilio API calls

**Cons:**
- All hotlines use the same voice character

**Implementation:** This is the current behavior. All calls start with the "default" voice configuration.

### Option 2: Implement Handoff (Disconnect/Reconnect) ⚠️

**Pros:**
- Allows different voices for different hotlines
- Uses existing `getHandoffUrl()` function

**Cons:**
- **Interrupts user experience** - call disconnects and reconnects
- User hears dial tone/connection sounds
- More complex implementation
- Requires additional Twilio API calls

**Implementation:** Would require using Twilio's `<Redirect>` or `<Dial>` TwiML verbs to handoff the call to a new TwiML endpoint with the desired voice configuration.

**Reference:** [Twilio Redirect Documentation](https://www.twilio.com/docs/voice/twiml/redirect)

### Option 3: Separate Phone Numbers per Hotline

**Pros:**
- Each hotline can have its own voice from the start
- No call interruption

**Cons:**
- Requires multiple phone numbers (additional cost)
- Users need to know which number to call for which hotline
- More complex setup

## Code Location

The voice configuration is defined in `server.ts`:

- **Voice configs:** Lines 25-75 (`VOICE_CONFIGS`)
- **TwiML endpoint:** Lines 78-115 (`/twiml`)
- **Handoff helper:** Lines 117-135 (`getHandoffUrl()`)

## Recommendation

**Keep the current implementation** (Option 1) for the best user experience. If different voices are essential, consider Option 3 (separate phone numbers) to avoid call interruption, or accept the trade-off of Option 2 (handoff) if the interruption is acceptable for your use case.

