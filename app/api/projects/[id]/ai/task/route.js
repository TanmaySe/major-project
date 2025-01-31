const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "You will be given a prompt by a user who wants to create a task in a PM tool. The prompt would contain certain details . On basis of that details you have to return me a JSON output. If any property of JSON is not found in the prompt then just leave that property. \nNote : Make sure that the deadline property is in dd-mm-yyyy format",
});

export async function POST(request,{params}) {
    try{
    const {prompt,members} = await request.json()
    console.log(prompt)
    const user = await currentUser()
    const { id } = await params;
    console.log("id mila atlast",id);
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
                "High",
                "Medium",
                "Low"
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
    if(!jsonRes.taskName){
      return NextResponse.json({error:"Couldnt figure out task name from prompt"},{status:400})
  }
    // jsonRes.created_by = user?.emailAddresses[0]?.emailAddress
    console.log("jsonRes : ",jsonRes)

    //send it to create task api.
    // console.log(new Date());
    const [day, month, year] = jsonRes.deadline.split('-');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    const taskPayload = {
      task:jsonRes.taskName,
      desc: jsonRes?.taskDescription,
      // deadline:jsonRes.deadline,
      deadline:formattedDate,
      priority:jsonRes.priority,
      proj_id: id,
      assigned:jsonRes.assignees,
      created_at: new Date(),
      created_by: user?.emailAddresses[0].emailAddress,
    };
    // create a task named start server assign it to Chaitanya Paranjpe, deadline should be 26-01-2025 and priority is medium
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        taskPayload
      ]);
        
    // Handle any error from Supabase
    if (error) {
      throw error;
    }

    return NextResponse.json({data:"Successfully created task"},{status:200})
    } catch(error) {
        return NextResponse.json({error:error.message},{status:500})
    }


      
}