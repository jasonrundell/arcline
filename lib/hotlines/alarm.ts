import { ConversationRelayRequest, ConversationRelayResponse } from "@/types/twilio";
import { supabase } from "@/lib/supabase";

export async function handleAlarmHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";

  const updatedMemory: Record<string, unknown> = { ...memory, hotlineType: "alarm" };

  switch (step) {
    case "greeting":
      updatedMemory.step = "time";
      return {
        actions: [
          {
            say: "Welcome to the Wake-Up Call and Raid Alarm service. Please tell me what time you'd like to be alerted. For example, say '8 AM' or '14:30'.",
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "time":
      const timeInput = request.CurrentInput;
      updatedMemory.alarmTime = timeInput;
      updatedMemory.step = "message";
      
      return {
        actions: [
          {
            say: `I've noted the time: ${timeInput}. What message would you like to receive?`,
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "message":
      const message = request.CurrentInput;
      const alarmTime = updatedMemory.alarmTime as string;
      const phoneNumber = memory.phoneNumber as string || "unknown";
      
      try {
        // Parse time (simplified - in production, use proper date parsing)
        const now = new Date();
        let alarmDate = new Date();
        
        // Simple time parsing (this is a basic implementation)
        const timeMatch = alarmTime.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const period = timeMatch[3]?.toLowerCase();
          
          if (period === "pm" && hours !== 12) hours += 12;
          if (period === "am" && hours === 12) hours = 0;
          
          alarmDate.setHours(hours, minutes, 0, 0);
          if (alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 1);
          }
        } else {
          // Default to 1 hour from now if parsing fails
          alarmDate.setHours(alarmDate.getHours() + 1);
        }

        await supabase.from("alarms").insert({
          phone_number: phoneNumber,
          alarm_time: alarmDate.toISOString(),
          message: message,
          status: "pending",
        });

        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: `Alarm set for ${alarmTime} with message: ${message}. You'll receive your wake-up call at the scheduled time.`,
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      } catch (error) {
        console.error("Error setting alarm:", error);
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "I'm sorry, there was an error setting your alarm. Please try again later.",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      }

    default:
      updatedMemory.step = "greeting";
      return {
        actions: [
          {
            say: "Thank you for using the Wake-Up Call service. Goodbye.",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };
  }
}

