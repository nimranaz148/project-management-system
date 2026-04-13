
import { asyncHandler } from "../utils/async-handler.js";
import openai from "../config/openai.js";
import { ProjectTable } from "../models/project.models.js";
import {Task } from "../models/task.model.js";
import { ProjectMember } from "../models/projectMemberRole.model.js"
import { ApiResponse } from "../utils/api-response.js";



const askAI = async (systemPrompt, userPrompt) => {
    
    const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: userPrompt,
        instructions: systemPrompt,
        temperature: 0.7,
    });

    let content = response.output_text;

    // Strip markdown code fences if present
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    return {
        result: JSON.parse(content),
        metaData: {
            processingTime: Date.now(),
        }
    }
}


//----------------------------Suggest Tasks-------------------------
export const suggestTasks = asyncHandler(async (req , res) => {
    const { projectId } = req.params
    if(!projectId){
        return res.status(200).json({ error:" projectId is required"})
    }

    const {context, count, includeSubtasks} = req.body
    if(!context){
        return res.status(400).json({ error:" Context is required"})
    }

    const project = await ProjectTable.findById(projectId)
    if(!project){
        return res.status(404).json({ error:" Project not found"})

    }

    const existingTasks = await Task.find({project: projectId}).limit(20)

    // get team member of this project
    const members = await  ProjectMember.find({project: projectId})

    // prepare system prompt for AI
    const sysPrompt = `you are a project management AI assistant.
     your job is to suggest relevant task for software projects.
     always respond in JSON format only ` 

    // prepare user prompt fot ai
    const usrPrompt = `
    project name : ${project.name}
    project context : ${context}
    team size : ${members.length} members
    team members : ${members.map(m => m.user).join(",")}

    existing tasks(avoid duplicates): ${existingTasks.map(t => t.title).join(",")}

    generate ${count || 5} task suggestions${includeSubtasks ? "with subtasks" : ""}

    respond with this exact JSON format:
    {
    suggestions: [
        {
           title: "task title",
           description: "task description",
           "priority": "low/medium/high/critical",
           "estimatedHours": number,
           "suggestedTags" : ["tag1","tag2"],
           "subtasks": ["subtask1" , "subtask2"] ,
           "dependencies" : ["existing-task1", "existing-task2"]



      }
    ],

    "reasoning" : "why these task were suggested, explain your reasoning here in detail",

    "estimatedTtotalTime" : "x hours",

    "confidence" : 0.0 to 1.0 // how confident are you about these suggestion, 1.0 means very confident, 0.0 means not confident at all
    
    }
   `
  const startTime = Date.now()
  const { result, metaData} = await askAI(sysPrompt, usrPrompt)
  metaData.processingTime = Date.now() - startTime

  return res.status(200).json(new ApiResponse(200, {...result, metaData}, "Task suggestions generated successfully"))


})


//------------------------analyzeRisks-----------------------
export const analyzeRisks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).json({ error: "projectId is required" });
  }

  const project = await ProjectTable.findById(projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const now = new Date();
  const [totalTasks, doneTasks, overDueTasks, inProgressTasks] = await Promise.all([
    Task.countDocuments({ project: projectId }),
    Task.countDocuments({ project: projectId, status: "done" }),
    Task.countDocuments({ project: projectId, dueDate: { $lt: now }, status: { $ne: "done" } }),
    Task.countDocuments({ project: projectId, status: "in-progress" }),
  ]);

  // GET OVERDUE TASK DETAILS
  const overdueTaskDetails = await Task.find({ project: projectId, dueDate: { $lt: now }, status: { $ne: "done" } })
    .populate("assignedTo", "username")
    .select("title dueDate priority assignedTo")
    .limit(10);

  // GET MEMBER WORKLOAD
  const members = await ProjectMember.find({ project: projectId });

  // CALCULATE WORKLOAD for each member
  const workloads = await Promise.all(
    members.map(async (m) => {
      const count = await Task.countDocuments({
        project: projectId,
        assignedTo: m.user._id,
        status: { $ne: "done" },
      });

      return { username: m.user.username, activeTasks: count };
    })
  );

  // Prepare AI prompts
  const sysPrompt = `You are a project risk analysis AI assistant.
Analyze project data and identify potential risks with recommendations.
Always respond in JSON format only.`;

  const usrPrompt = `
Project name: ${project.name}
Total tasks: ${totalTasks}
Completed tasks: ${doneTasks}
In-progress tasks: ${inProgressTasks}
Overdue tasks: ${overDueTasks}

overdueTaskDetails:
${overdueTaskDetails.map((t) => (
  `- ${t.title}, due on ${t.dueDate ? t.dueDate.toDateString() : "no due date"}, priority: ${t.priority}, assigned to: ${t.assignedTo?.username || "unassigned"}`
)).join("\n")}
    

    team workload:
    ${workloads.map(w => `- ${w.username}: ${w.activeTasks} active tasks`).join("\n")}
    
    respond with this exact JSON format:
    {
        "overallRisk" : "low/medium/high/critical",
        "healthScore" : 0 to 100, // 100 means very healthy, 0 means very unhealthy,
        "risks" : [
            {
                "category": "schedule/budget/scope/quality/resource/other",
                "severity": "low/medium/high/critical",
                "title": "risk title",
                "description": "detailed risk description",
                "recommendation": "detailed recommendation to mitigate this risk",
                "impact" : "potential impact description"
            }
        ],

        "positives": ["what is going well in this project? list of positives"],
        "summary": "overall summary of the project health and risks in detail"
    }
    `
    
    const startTime = Date.now()
    const {result, metaData} = await askAI(sysPrompt, usrPrompt)
    metaData.processingTime = Date.now() - startTime

    return res.status(200).json(new ApiResponse(200, {...result, metaData}, "Project risk analysis generated successfully"))

})



//------------------------predictTimeline-----------------------
export const predictTimeline = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).json({ error: "projectId is required" });
  }

  const project = await ProjectTable.findById(projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const tasks = await Task.find({ project: projectId }).select("title status estimatedHours");

  const sysPrompt = `You are a project timeline prediction AI assistant.
Analyze project tasks and predict timeline to completion.
Always respond in JSON format only.`;

const usrPrompt = `
Project name: ${project.name}
created: ${project.createdAt}

task details:
- Total: ${tasks.length}
- Todo: ${tasks.filter(t => t.status === "todo").length}
- In-progress: ${tasks.filter(t => t.status === "in-progress").length}
- Done: ${tasks.filter(t => t.status === "done").length}

 estimated hours remaining: ${tasks.filter(t => t.status !== "done").reduce((sum, t) => sum + (t.estimatedHours || 0), 0)}

 overdue tasks: ${tasks.filter(t => t.status !== "done" && t.dueDate && t.dueDate < new Date()).length}

 respond with this exact JSON format:
 {
    "predictedCompletionDate": "ISO date format",
    "confidence": 0 to 1, // how confident are you about this prediction, 1 means very estimatedDaysRemaining: number,
    scenarios: {
       "optimistic" : ISO date format,
        "pessimistic" : ISO date format,
        "realistic" : ISO date format
    },
    "bottlenecks": ["bottleneck1", "bottleneck2", ...],
    "recommendations": ["recommendation1", "recommendation2", ...],
    "summary": "detailed summary of the predicted timeline and reasoning"

    
  }
    `
    const startTime = Date.now()
    const {result, metaData} = await askAI(sysPrompt, usrPrompt)
    metaData.processingTime = Date.now() - startTime

    return res.status(200).json(new ApiResponse(200, {...result, metaData}, "Predicted timeline generated successfully"))
})


//------------------------balanceWorkload-----------------------
export const balanceWorkload = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).json({ error: "projectId is required" });
  }

  const project = await ProjectTable.findById(projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const members = await ProjectMember.find({ project: projectId })

  // calculate workload for each member
  const workloads = await Promise.all(
    members.map(async (m) => {
      const tasks = await Task.find({
        project: projectId,
        assignedTo: m.user._id,
        status: { $ne: "done" },

      }).select("title status")

      return { username: m.user.username, activeTasks: tasks.length, tasks: tasks.map(t => ({ title: t.title, status: t.status })) };
    })
  )


   // get unassigned tasks
    const unassignedTasks = await Task.find({project: projectId, assignedTo: null, status: {$ne: "done"}}).select("title status priority")

    const sysPrompt = `you are a project workload balancing AI assistant.
    Analyze team workload and suggest optimal task assignments to balance the workload.
    Always respond in JSON format only.`

    const usrPrompt = `
    project name: ${project.name}

    team members and their workloads:
    ${workloads.map(w => `- ${w.username}: ${w.activeTasks} active tasks (${w.tasks.map(t => `${t.title} [${t.status}, ${t.priority}]`).join(", ")})`).join("\n")}

    unassigned tasks:
    ${unassignedTasks.map(t => `- ${t.title} [${t.status}, ${t.priority}]`).join("\n")}

    respond with this exact JSON format:
    {
        isBalanced: true/false,
        teamAverage: number,
        overLoadedMembers: ["username1", "username2", ...],
        underLoadedMembers: ["username1", "username2", ...],
        suggestions: [
            {
                action: "assign/reassign",
                task: "task title",
                fromMember: "username or unassigned",
                toMember: "username or unassigned",
                reasoning: "detailed reasoning for this suggestion"
            }
        ],
        summary: "overall summary of the workload balance and suggestions"
    }`

    const startTime = Date.now()
    const {result, metaData} = await askAI(sysPrompt, usrPrompt)
    metaData.processingTime = Date.now() - startTime

    return res.status(200).json(new ApiResponse(200, {...result, metaData}, "Workload balance analysis generated successfully"))
})

//------------------------smartassignTask-----------------------
export const smartassignTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  if (!taskId) {
    return res.status(400).json({ error: "taskId is required" });
  }
  const task = await Task.findById(taskId).populate("project")
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const members = await ProjectMember.find({ project: task.project._id })

  const {considerWorkload = true, considerSkills = true} = req.body

    // calculate workload for each member
    const workloads = await Promise.all(
    members.map(async (m) => {
      const count = await Task.countDocuments({
        project: task.project._id,
        assignedTo: m.user._id,
        status: { $ne: "done" },
      });

      return { username: m.user.username, userId: m.user._id, fullName: m.user.fullName, activeTasks: count };
    })
   )

    const sysPrompt = `you are a smart task assignment AI assistant.
    your job is to suggest the best team member to assign a given task to, in order to balance the workload and ensure timely completion.
    Always respond in JSON format only.`

    const usrPrompt = `
    project name: ${task.project.name}
    task title: ${task.title}
    task description: ${task.description}
    task priority: ${task.priority}
    task estimated hours: ${task.estimatedHours || "not specified"}

    team members and their workloads:
    ${workloads.map(w => `- ${w.username} (${w.fullName}): ${w.activeTasks} active tasks`).join("\n")}

    consider workload balance: ${considerWorkload}
    consider skill match: ${considerSkills}

    respond with this exact JSON format:
    {
    recommendation:[
    {
    username: "username",
    userId: "userId",
    fullName: "full name",
    score: 0.0 to 1.0,
    reasoning: ["reason1", "reason2", ...],
    estimatedTimeToComplete: "ISO date string",
    riskFactors: ["risk1", "risk2", ...]
}
    ],
    summary: "overall summary of the assignment recommendation and reasoning"
    }


    `
    const startTime = Date.now()
    const {result, metaData} = await askAI(sysPrompt, usrPrompt)
    metaData.processingTime = Date.now() - startTime

    return res.status(200).json(new ApiResponse(200, {...result, metaData}, "Smart task assignment generated successfully"))
})
   

//------------------------prioritizeTask-----------------------
export const prioritizeTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  if (!taskId) {
    return res.status(400).json({ error: "taskId is required" });
  }
  const task = await Task.findById(taskId).populate("project")
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  // get other task in project for context
  const projectTasks = await Task.find({ project: task.project._id }).select("title status priority dueDate")

  const sysPrompt = `you are a task prioritization AI assistant.
  your job is to suggest the priority level for a given task based on its attributes and project context.
  Always respond in JSON format only.`

  const usrPrompt = `
  project name: ${task.project.name}
  task title: ${task.title}
  task description: ${task.description}
  task status: ${task.status}
  task priority: ${task.priority}
  task estimated hours: ${task.estimatedHours || "not specified"}
  task due date: ${task.dueDate || "not specified"}

  project tasks:
  ${projectTasks.map(t => `- ${t.title} (Priority: ${t.priority}, Due Date: ${t.dueDate})`).join("\n")}

  respond with this exact JSON format:
  {
   currentPriority: "current priority level",
   suggestedPriority: "low/medium/high/critical",
   shouldChange: true/false,
   reasoning: ["reason1", "reason2", ...],
   confidence: 0.0 to 1.0,
   urgencyFactors: ["factor1", "factor2", ...],
   impactFactors: ["factor1", "factor2", ...],
   summary: "overall summary of the prioritization recommendation and reasoning"
  }
  `
  const startTime = Date.now()
  const {result, metaData} = await askAI(sysPrompt, usrPrompt)
  metaData.processingTime = Date.now() - startTime

  return res.status(200).json(new ApiResponse(200, {...result, metaData}, "Task prioritization generated successfully"))

})


//------------------------Summarize-Meeting-----------------------
export const summarizeMeeting = asyncHandler(async (req, res) => {
  const {notes, projectId, meetingDate} = req.body

  if(!notes || !projectId || !meetingDate){
    return res.status(400).json({error: "Notes, projectId and meetingDate are required"})
  }

  const project = await ProjectTable.findById(projectId)
  if(!project){
    return res.status(404).json({error: "Project not found"})
  }

  const sysPrompt = `you are a meeting summarization AI assistant.
  your job is to summarize the meeting notes, highlighting key discussion points, decisions made, and action items with assignes, deadlines and overall summary.
  Always respond in JSON format only.`

  const usrPrompt = `
  project name: ${project.name}
  meeting date: ${new Date(meetingDate).toDateString()}

  meeting notes:
  ${notes}

  respond with this exact JSON format:
  {
     "summary": "overall summary of the meeting",
     "keyPoints": ["key point 1", "key point 2", ...],
     actionItems: [
        {
          task: "action item description",
          assignee: "assignee name",
          deadline: "ISO date string",
          priority: "low/medium/high/critical",
          reasoning: ["reason1", "reason2", ...]
          
        }
     ],
     "blockers" : ["blocker1", "blocker2", ...],
     "nextsteps": ["next step 1", "next step 2", ...]
     followUpDueDate: "ISO date format"
  }
  `
  const startTime = Date.now()
  const {result, metaData} = await askAI(sysPrompt, usrPrompt)
  metaData.processingTime = Date.now() - startTime

  return res.status(200).json(new ApiResponse(200, {...result, metaData}, "Meeting summary generated successfully"))


})