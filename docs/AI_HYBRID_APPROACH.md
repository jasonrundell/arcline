# AI Hybrid Approach for Shani's Responses

## Overview

The hotline system uses a **hybrid approach** that combines scripted responses with AI-generated responses from Perplexity's API. This provides the best balance of speed, reliability, and natural conversation.

## Architecture

### Scripted Responses (Always Used)

- **Greeting**: Initial welcome message when hotline is accessed
- **Exit/Goodbye**: Closing message when user ends conversation
- **Default Fallback**: Default response for unexpected states
- **Error Fallback**: Used when AI API is unavailable or fails

### AI-Generated Responses (When Available)

- **User Questions**: Dynamic responses to user queries
- **Unexpected Inputs**: Handles inputs not covered by scripted responses
- **Contextual Responses**: Provides varied, natural responses based on conversation context

## Implementation

### Location

- **AI Generator**: `lib/ai/shaniresponse.ts`
- **Hotline Handler**: `lib/hotlines/chicken.ts` (example implementation)

### How It Works

1. **Standard Flows Use Scripted Responses**

   ```typescript
   case "greeting":
     return { say: SCRIPTED_RESPONSES.greeting, ... };
   ```

2. **Dynamic Questions Use AI**

   ```typescript
   case "listening":
     const aiResponse = await generateShaniResponse({
       context: "Scrappy's material collection channel",
       userInput: request.CurrentInput,
       additionalContext: "Scrappy is a rooster..."
     });
   ```

3. **Fallback on Error**
   ```typescript
   catch (error) {
     // Uses scripted fallback response
     return { say: fallbackResponse, ... };
   }
   ```

## Configuration

### Environment Variable

Add to your `.env` file:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key
```

**Note**: If `PERPLEXITY_API_KEY` is not set, the system automatically uses scripted fallback responses. The hotline will still function normally.

### Getting an API Key

1. Sign up at [Perplexity API Platform](https://www.perplexity.ai/api-platform)
2. Create an API key
3. Add it to your `.env` file

## Benefits

### Speed

- Scripted responses are instant (no API latency)
- AI responses add ~500ms-2s but provide better quality

### Reliability

- System works even if API is down (uses fallbacks)
- No single point of failure

### Cost Efficiency

- Only uses AI for dynamic responses
- Standard flows (greeting, exit) don't incur API costs
- Estimated cost: ~$0.01-0.02 per conversation turn

### Quality

- Consistent, professional greetings and exits
- Natural, varied responses to user questions
- Maintains Shani's persona throughout

## Shani's Persona

The AI system uses a detailed persona prompt based on `docs/personas/SHANI.md`:

- **Direct, tactical, professional** communication style
- **British English** (en-GB) accent and phrasing
- **Military/tactical language**: "Copy that", "Request acknowledged"
- **ARC Raiders terminology**: topside, Raider, Speranza, ARC activity
- **Concise responses**: 2-3 sentences max for voice calls

## Extending to Other Hotlines

To add AI responses to other hotlines:

1. Import the generator:

   ```typescript
   import { generateShaniResponse } from "../ai/shaniresponse";
   ```

2. Use in your handler:

   ```typescript
   const aiResponse = await generateShaniResponse({
     context: "Your hotline context",
     userInput: request.CurrentInput,
     additionalContext: "Any relevant context",
   });
   ```

3. Add error handling:
   ```typescript
   try {
     // Use AI response
   } catch (error) {
     // Fallback to scripted response
   }
   ```

## Monitoring

The system logs:

- API key configuration warnings
- API errors (falls back gracefully)
- Response generation failures

Check your server logs to monitor AI usage and any issues.

## Cost Considerations

### Token Usage

- **System Prompt**: ~500 tokens (one-time per request)
- **User Message**: ~50-100 tokens
- **Response**: ~50-150 tokens
- **Total per turn**: ~600-750 tokens

### Pricing (as of 2024)

- Perplexity models vary by model type
- **llama-3.1-sonar-small-128k-online**: Fast, cost-effective model for chat
- **Estimated cost per turn**: Varies by model - check [Perplexity Pricing](https://www.perplexity.ai/pricing) for current rates

### Optimization Tips

- Keep responses concise (max_tokens: 150)
- Use scripted responses for common flows
- Cache responses for identical queries (future enhancement)

## Troubleshooting

### AI Not Working

1. Check `PERPLEXITY_API_KEY` is set in `.env`
2. Verify API key is valid
3. Check server logs for errors
4. System will automatically use fallback responses

### Responses Too Long

- Adjust `max_tokens` in `lib/ai/shaniresponse.ts`
- Update system prompt to emphasize brevity

### Responses Not Matching Persona

- Review and update `SHANI_SYSTEM_PROMPT` in `lib/ai/shaniresponse.ts`
- Reference `docs/personas/SHANI.md` for persona details
