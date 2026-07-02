import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const SYSTEM_PROMPT = `You are a real, human business owner replying to Google reviews. Write your replies so naturally that NO ONE could ever guess it was written by AI. 

RULES:
1. Tone: Sound like a normal, friendly human being. DO NOT use robotic, dramatic, or overly corporate phrases like "We are absolutely thrilled," "It was our utmost pleasure," or "We look forward to welcoming you back." Keep it casual, warm, and authentic.
2. Format: Write the ENTIRE reply as one single, short, flowing paragraph. DO NOT use any line breaks (\\n), spaces between paragraphs, or formal letter structures. Blend the greeting, response, and sign-off seamlessly.
3. Personalise: Greet the reviewer by first name if available and reference one specific detail they mentioned.
4. Positive reviews: Say a quick, genuine thank you and invite them back naturally (e.g., "Hope to see you again soon!").
5. Negative reviews: Apologise plainly without making excuses, and ask them to reach out offline.
6. Clinic reviews: Never mention or confirm any medical details. Thank/apologise generally. Privacy always wins.
7. Fake/abusive reviews: State factually that you have no record of their visit and invite them to contact you directly.
8. Include exactly 1 relevant emoji seamlessly INSIDE the text where it naturally fits the context. DO NOT tack it on at the end.
9. If an ADDITIONAL INSTRUCTION FROM OWNER is provided at the end of the prompt, you MUST follow it exactly in all 2 drafts.

OUTPUT: Return ONLY a JSON object with a single key "drafts" containing exactly 2 strings. No preamble. Example: {"drafts": ["Hi John! Thanks for stopping by, I'm really glad you liked the biryani 🥘 and hope to see you again soon. - The Owner", "draft two"]}`;

// Handle CORS for the Chrome Extension
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, reviewerName, rating, reviewText, customInstruction } = body;

    // 1. Validate inputs
    if (!reviewerName || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch Business Profile & Enforce Usage Limits
    let businessStr = "Generic Business / Shop / India / Professional / English / No special rules";
    let subscription = null;
    let userId = null;
    
    if (businessId) {
      const business = await prisma.business.findUnique({ 
        where: { id: businessId },
        include: { user: { include: { subscription: true } } }
      });
      if (business) {
        businessStr = `${business.name} / ${business.type} / ${business.city} / ${business.tone} / ${business.language} / ${business.phone} / ${business.rules || 'None'}`;
        subscription = business.user?.subscription;
        userId = business.userId;
      }
    }

    // Check usage limits
    if (subscription) {
      if (subscription.status === 'trial' && subscription.repliesGeneratedThisMonth >= subscription.maxLimit) {
        return NextResponse.json({ error: "LIMIT_REACHED" }, { 
          status: 402, // Payment Required
          headers: { "Access-Control-Allow-Origin": "*" } 
        });
      }
    }

    // 3. Construct the prompt
    let userMessage = `${businessStr}\n\nReviewer: ${reviewerName}\nRating: ${rating} Stars\nReview: ${reviewText || "No text provided."}`;
    
    if (customInstruction) {
      userMessage += `\n\nADDITIONAL INSTRUCTION FROM OWNER: ${customInstruction}`;
    }

    // 4. Call Groq API (Llama 3.1)
    const apiKey = process.env.GROQ_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    let aiText = "";
    try {
      const groq = new Groq({ apiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
      });
      aiText = chatCompletion.choices[0]?.message?.content || "";
    } catch (error: any) {
      console.error("[Groq API Error]:", error);
      return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 });
    }
    
    /* 
    // === Old Google Gemini API Code (Commented out per request) ===
    const keys = (process.env.GOOGLE_GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) {
      return NextResponse.json({ error: "No API keys configured" }, { status: 500 });
    }

    let aiText = "";
    let lastError = null;

    for (const key of keys) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest",
          generationConfig: {
            responseMimeType: "application/json",
          }
        });

        const result = await model.generateContent(`System: ${SYSTEM_PROMPT}\n\nUser: ${userMessage}`);
        aiText = result.response.text();
        break; // Success! Exit the loop.
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini API] Request failed with key ending in ...${key.slice(-4)}. Error:`, error.message);
        if (error.message?.includes('429') || error.status === 429) {
          console.log("-> Trying next API key...");
          continue;
        }
        continue;
      }
    }

    if (!aiText) {
      console.error("All API keys failed. Last error:", lastError);
      return NextResponse.json({ error: "All API keys exhausted or failed" }, { status: 429 });
    }
    */
    
    // Clean up potential markdown formatting that local models sometimes add
    aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

    // 5. Parse JSON response
    let drafts: string[] = [];
    try {
      const parsed = JSON.parse(aiText);
      drafts = parsed.drafts || [];
      // Fallback if the model still generated an array directly instead of an object
      if (Array.isArray(parsed)) {
        drafts = parsed;
      }
    } catch (e) {
      console.error("Failed to parse Ollama output as JSON:", aiText);
      return NextResponse.json({ error: "Failed to generate valid drafts" }, { status: 500 });
    }

    // 6. Save to database history and update usage
    if (businessId && userId) {
      await prisma.reply.create({
        data: {
          businessId,
          reviewerName,
          rating,
          originalReview: reviewText || "",
          generatedReplies: JSON.stringify(drafts),
        }
      });
      
      if (subscription) {
        await prisma.subscription.update({
          where: { userId: userId },
          data: {
            repliesGeneratedThisMonth: { increment: 1 }
          }
        });
      }
    }

    // 7. Return drafts with CORS headers
    return NextResponse.json({ drafts }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });

  } catch (error) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
