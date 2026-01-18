import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
// @ts-ignore
// import pdf from 'pdf-parse'; removed in favor of require

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not defined');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const familyId = formData.get('familyId') as string;

    console.log('Analyze Request:', {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      familyId
    });

    if (!file || !familyId) {
      return NextResponse.json({ error: 'Missing file or familyId' }, { status: 400 });
    }

    let extractedText = '';

    // Handle PDF files
    if (file.type === 'application/pdf') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        // @ts-ignore
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        extractedText = data.text;
        console.log('PDF Text Extraction Success, length:', extractedText.length);
      } catch (e) {
        console.error('PDF Parse Error:', e);
        throw new Error('PDF Parse Failed');
      }
    } else {
      // For now, we only support PDF text extraction reliably without OCR
      // If it's a small image we might try vision but user asked for conversion
      return NextResponse.json({
        error: 'For best results, please upload a PDF document so we can read the text accurately.'
      }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: 'No text could be extracted from this document.' }, { status: 400 });
    }

    console.log('Sending to Groq (Text Mode):', {
      model: "llama-3.3-70b-versatile",
      textLength: extractedText.length
    });

    // Analyze extracted text with Llama 3.3
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze this medical document text and extract actionable care tasks.
          
          DOCUMENT TEXT:
          "${extractedText.slice(0, 30000)}" 
          
          (Note: Text may be truncated if too long)

          Please provide a JSON response with the following structure:
          {
            "document_type": "discharge_summary|prescription|care_plan|other",
            "patient_info": {
              "name": "extracted name or null",
              "conditions": ["list of medical conditions"]
            },
            "tasks": [
              {
                "title": "Clear, actionable task title",
                "description": "Detailed description of what needs to be done",
                "priority": "low|medium|high|urgent",
                "due_date": "YYYY-MM-DD or null if not specified",
                "category": "medication|appointment|monitoring|lifestyle|other"
              }
            ],
            "key_information": ["Important notes or warnings"],
            "summary": "Brief summary of the document content"
          }
          
          Focus on extracting specific, actionable tasks that family members can complete. Return ONLY valid JSON.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    console.log('Groq Response Received');

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      console.error('Groq returned empty content');
      return NextResponse.json({ error: 'No analysis result' }, { status: 500 });
    }

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
      console.log('Analysis Parsed Successfully');
    } catch (parseError) {
      console.error('Failed to parse analysis result:', parseError);
      console.log('Raw analysis text:', analysisText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Prepare response for client-side persistence
    const documentId = `doc-${Date.now()}`;

    // Create tasks with IDs for the client
    const tasksData = analysisResult.tasks.map((task: any, index: number) => ({
      id: `task-${Date.now()}-${index}`,
      family_id: familyId,
      document_id: documentId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString() : null,
      status: 'pending',
      assigned_to: null,
      created_at: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        family_id: familyId,
        filename: file.name,
        document_type: analysisResult.document_type,
        analysis_result: analysisResult,
        created_at: new Date().toISOString()
      },
      tasks: tasksData,
      analysis: analysisResult,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    // User requested "fake or demo tasks and also demo users just in case"
    // So we fall back to a demo response on error
    // Use fallbacks if file/familyId are not defined due to error occurring before extraction
    const safeFamilyId = 'demo-family-id';
    // Create a dummy file object for the demo signature
    const safeFile = new File(["demo content"], "demo.pdf", { type: "application/pdf" });

    return NextResponse.json(await getDemoResponse(safeFile, safeFamilyId));
  }
}

async function getDemoResponse(file: File, familyId: string) {
  const documentId = `doc-demo-${Date.now()}`;
  const today = new Date();

  // Create consistent demo tasks
  const tasks = [
    {
      id: `task-demo-1`,
      family_id: familyId,
      document_id: documentId,
      title: "Schedule Cardiologist Follow-up",
      description: "Patient needs a follow-up appointment with Dr. Smith in 2 weeks to review medication efficacy.",
      priority: "high",
      due_date: new Date(today.setDate(today.getDate() + 14)).toISOString(),
      status: "pending",
      assigned_to: null,
      created_at: new Date().toISOString()
    },
    {
      id: `task-demo-2`,
      family_id: familyId,
      document_id: documentId,
      title: "Pick up Lisinopril Prescription",
      description: "Prescription sent to CVS Pharmacy. Needs to be picked up by end of week.",
      priority: "medium",
      due_date: new Date(today.setDate(today.getDate() + 2)).toISOString(),
      status: "pending",
      assigned_to: null,
      created_at: new Date().toISOString()
    },
    {
      id: `task-demo-3`,
      family_id: familyId,
      document_id: documentId,
      title: "Monitor Blood Pressure Daily",
      description: "Record blood pressure readings every morning and evening for the next 7 days.",
      priority: "urgent",
      due_date: new Date(today.setDate(today.getDate() + 7)).toISOString(),
      status: "pending",
      assigned_to: null,
      created_at: new Date().toISOString()
    }
  ];

  const analysisResult = {
    document_type: "discharge_summary",
    patient_info: { name: "John Doe", conditions: ["Hypertension", "Type 2 Diabetes"] },
    tasks: tasks, // Embedded for consistency in structure
    key_information: ["Patient stable but requires monitoring", "Medication dosage adjusted"],
    summary: "This is a DEMO ANALYSIS generated because the automatic analysis encountered an issue (likely PDF parsing on this environment). It shows a typical discharge summary for a patient with hypertension."
  };

  // Re-map tasks to ensure flat structure if needed, but we already created them above
  const tasksData = tasks;

  return {
    success: true,
    document: {
      id: documentId,
      family_id: familyId,
      filename: file.name || "demo_document.pdf",
      document_type: "discharge_summary",
      analysis_result: analysisResult,
      created_at: new Date().toISOString()
    },
    tasks: tasksData,
    analysis: analysisResult,
    is_demo: true
  };
}