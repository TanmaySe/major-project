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
    systemInstruction: "You will be given details of a project and your responsibility is to answer the prompt in context of the project details provided to you.",
});

export async function POST(request,{params}) {
    try{
    const {prompt} = await request.json()
    const user = await currentUser()
    const { id } = await params;
    if(!user) {
        return NextResponse.json({error:"There was an issue authenticating you"},{status:500})
    }
    const {data:projectData,error:projectError} = await supabase
    .from('project')
    .select('*')
    .eq('id',id)
    if(projectError){
        return NextResponse.json({error:projectError},{status:500})
    }
    console.log("Projectdata : ",projectData)
    let finalPrompt = "Project name is :"+projectData[0]?.name+". Owner of the project is : "+projectData[0]?.owner+". Description of project is : "+projectData[0]?.desc+". \n"
    const {data:taskData,error:taskError} = await supabase.from('tasks').select('*').eq('proj_id',id)
    if(taskError) {
        return NextResponse.json({error:taskError},{status:500})
    }
    console.log("TaskData : ",taskData)
    finalPrompt += "I am giving you an array of objects. Each object represents a task. \n"
    finalPrompt += JSON.stringify(taskData) +"\n"
    finalPrompt += "On the basis of the above information answer the given below question(s) : \n"
    finalPrompt += prompt
    console.log("finalPrompt : ",finalPrompt)
    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    };
    const chatSession = model.startChat({
        generationConfig,
        history: [
        ],
    });
    
    const result = await chatSession.sendMessage(finalPrompt);
    const res = result.response.text()
    return NextResponse.json({data:res},{status:200})
    }catch(error) {
        return NextResponse.json({error:error.message},{status:500})
    }
}