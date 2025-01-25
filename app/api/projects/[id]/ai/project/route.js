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
    try {
        const {prompt} = await request.json()
        const user = await currentUser()
        const { id } = await params;
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
                projectName: {
                  type: "string"
                },
                projectDescription: {
                  type: "string"
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
        if(!jsonRes.projectName){
            return NextResponse.json({error:"You didn't mention Name"},{status:400})
        }
        const { data, error } = await supabase.rpc('create_project_with_member', {
            created_by : user?.emailAddresses[0].emailAddress,
            member_email : user?.emailAddresses[0].emailAddress,
            member_name : user?.firstName,
            member_role:"owner",
            project_desc:jsonRes.projectDescription,
            project_name:jsonRes.projectName
        })
        if (error) {
          throw error;
        }
        return NextResponse.json({data:"Successfully created project"},{status:200})
        
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }


}
