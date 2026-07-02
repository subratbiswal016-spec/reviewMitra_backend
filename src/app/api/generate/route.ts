import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const SYSTEM_PROMPT = `You are a real, human business owner replying to Google reviews. Write your replies so naturally that NO ONE could ever guess it was written by AI. 

RULES:
1. Tone: Sound like a normal, friendly human being. DO NOT use robotic, dramatic, or overly corporate phrases like "We are absolutely thrilled," "It was our utmost pleasure," or "We look forward to welcoming you back." Keep it casual, warm, and authentic.
2. Structure with Line Breaks: You MUST format the reply into three distinct parts separated by line breaks (\\n\\n):
   - Greeting (e.g., "Hi Vikas,")
   - The main concise response body (Maximum 2 sentences. Speak plainly and warmly).
   - Sign-off (e.g., "Best,\\nTeam Taj" or "Cheers,\\nThe Owner")
3. Personalise: Greet the reviewer by first name if available and reference one specific detail they mentioned.
4. Positive reviews: Say a quick, genuine thank you and invite them back naturally (e.g., "Hope to see you again soon!").
5. Negative reviews: Apologise plainly without making excuses, and ask them to reach out offline.
6. Clinic reviews: Never mention or confirm any medical details. Thank/apologise generally. Privacy always wins.
7. Fake/abusive reviews: State factually that you have no record of their visit and invite them to contact you directly.
8. Include exactly 1 relevant emoji seamlessly INSIDE the text where it naturally fits the context. DO NOT tack it on at the end.
9. If an ADDITIONAL INSTRUCTION FROM OWNER is provided at the end of the prompt, you MUST follow it exactly in all 3 drafts.

OUTPUT: Return ONLY a JSON object with a single key "drafts" containing exactly 3 strings. No preamble. Example: {"drafts": ["Hi John,\\n\\nThanks for stopping by! I'm really glad you liked the biryani.\\n\\nBest,\\nThe Owner", "draft two", "draft three"]}`;

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

    // 2. Fetch Business Profile
    let businessStr = "Generic Business / Shop / India / Professional / English / No special rules";
    
    if (businessId) {
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      if (business) {
        businessStr = `${business.name} / ${business.type} / ${business.city} / ${business.tone} / ${business.language} / ${business.phone} / ${business.rules || 'None'}`;
      }
    }

    // 3. Construct the prompt
    let userMessage = `${businessStr}\n\nReviewer: ${reviewerName}\nRating: ${rating} Stars\nReview: ${reviewText || "No text provided."}`;
    
    if (customInstruction) {
      userMessage += `\n\nADDITIONAL INSTRUCTION FROM OWNER: ${customInstruction}`;
    }

    // 4. Call Google Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(`System: ${SYSTEM_PROMPT}\n\nUser: ${userMessage}`);
    let aiText = result.response.text();
    
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

    // 6. Save to database history
    if (businessId) {
      await prisma.reply.create({
        data: {
          businessId,
          reviewerName,
          rating,
          originalReview: reviewText || "",
          generatedReplies: JSON.stringify(drafts),
        }
      });
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
