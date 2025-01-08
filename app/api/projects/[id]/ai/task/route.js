const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "You will be given a prompt by a user who wants to create a task in a PM tool. The prompt would contain certain details . On basis of that details you have to return me a JSON output. If any property of JSON is not found in the prompt then just leave that property. \nNote : Make sure that the deadline property is in dd-mm-yyyy format",
});

export async function POST(request,{params}) {
    try{
    const {prompt} = await request.json()
    const user = await currentUser()
    if(!user) {
        return NextResponse.json({error:"There was an issue authenticating you"},{status:500})
    }
    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            deadline: {
              type: "string"
            },
            taskName: {
              type: "string"
            },
            taskDescription: {
              type: "string"
            },
            assignees: {
              type: "array",
              items: {
                type: "string"
              }
            },
            priority: {
              type: "string",
              enum: [
                "high",
                "medium",
                "low"
              ]
            }
          }
        },
    };
    const chatSession = model.startChat({
        generationConfig,
        history: [
        ],
    });
    const result = await chatSession.sendMessage(prompt);
    const res = result.response.text()
    let jsonRes = JSON.parse(res)
    console.log("jsonRes : ",jsonRes)

    if(!jsonRes.deadline){
        return NextResponse.json({error:"You didn't mention deadline"},{status:400})
    }
    if(!jsonRes.priority){
        return NextResponse.json({error:"You didn't mention priority"},{status:400})
    }
    jsonRes.created_by = user?.emailAddresses[0]?.emailAddress
    console.log("jsonRes : ",jsonRes)
    return NextResponse.json({data:"Successfully created task"},{status:200})
    } catch(error) {
        return NextResponse.json({error:error.message},{status:500})
    }


      
}