import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const familyId = formData.get('familyId') as string;

    if (!file || !familyId) {
      return NextResponse.json({ error: 'Missing file or familyId' }, { status: 400 });
    }

    // Convert file to base64 for Groq Vision API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: mimeType,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Analyze document with Groq Vision
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this medical document and extract actionable care tasks. 
              
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
              
              Focus on extracting specific, actionable tasks that family members can complete.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ],
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.1,
      max_tokens: 2048,
    });

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      return NextResponse.json({ error: 'No analysis result' }, { status: 500 });
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : analysisText;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse analysis result:', parseError);
      // Fallback: create a basic structure
      analysisResult = {
        document_type: "other",
        patient_info: { name: null, conditions: [] },
        tasks: [{
          title: "Review medical document",
          description: "Please review the uploaded medical document for important information",
          priority: "medium",
          due_date: null,
          category: "other"
        }],
        key_information: ["Document analysis failed - manual review required"],
        summary: "Document uploaded but automatic analysis failed"
      };
    }

    // Save document record to database
    const { data: documentData, error: docError } = await supabase
      .from('documents')
      .insert({
        family_id: familyId,
        uploaded_by: session.user.id,
        filename: file.name,
        file_url: publicUrl,
        document_type: analysisResult.document_type,
        analysis_result: analysisResult,
      })
      .select()
      .single();

    if (docError) {
      console.error('Database error:', docError);
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }

    // Create tasks from analysis
    const tasksToInsert = analysisResult.tasks.map((task: any) => ({
      family_id: familyId,
      document_id: documentData.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString() : null,
    }));

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (tasksError) {
      console.error('Tasks error:', tasksError);
      return NextResponse.json({ error: 'Failed to create tasks' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document: documentData,
      tasks: tasksData,
      analysis: analysisResult,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}