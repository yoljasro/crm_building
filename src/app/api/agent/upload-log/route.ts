import { NextResponse } from 'next/server';
import { readDB, writeDB, CallLog } from '@/lib/db';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const managerId = formData.get('managerId') as string;
    const phone = formData.get('phone') as string;
    const duration = formData.get('duration') as string;
    const targetId = formData.get('targetId') as string;
    const targetModel = formData.get('targetModel') as string;
    const date = formData.get('date') as string;
    const status = formData.get('status') as string || 'javob_berildi';
    const audioFile = formData.get('audio') as File | null;

    if (!managerId || !phone) {
      return NextResponse.json({ success: false, error: "managerId and phone are required" }, { status: 400 });
    }

    let audioUrl = "";

    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const fileName = `${crypto.randomUUID()}-${audioFile.name || 'call.mp3'}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
      audioUrl = `/uploads/audio/${fileName}`;
    }

    const db = readDB();
    
    // Find the operator name based on managerId or use a default
    // We assume managerId maps to an owner/agent. For simplicity, we just use "Agent #"
    const operatorName = `Agent #${managerId}`;

    const newCallLog: CallLog = {
      id: crypto.randomUUID(),
      operator: operatorName,
      managerId: Number(managerId),
      duration: Number(duration) || 0,
      status: status as CallLog["status"],
      notes: "Android Agent orqali avtomatik qo'shildi",
      date: date || new Date().toISOString(),
      audioUrl: audioUrl || undefined
    };

    if (targetModel === 'lead') {
      newCallLog.leadId = targetId;
    } else if (targetModel === 'owner') {
      newCallLog.ownerId = targetId;
    }

    db.calls = db.calls || [];
    db.calls.unshift(newCallLog); // Add to the beginning of the list
    
    // Cleanup queue item if exists
    db.agentQueue = db.agentQueue || [];
    const queueIndex = db.agentQueue.findIndex(q => 
      q.managerId === Number(managerId) && 
      q.phone === phone && 
      q.status === 'processing'
    );
    
    if (queueIndex !== -1) {
      db.agentQueue[queueIndex].status = "completed";
    }

    writeDB(db);

    return NextResponse.json({ success: true, data: newCallLog });
  } catch (error) {
    console.error("Error uploading call log:", error);
    return NextResponse.json({ success: false, error: "Server xatosi" }, { status: 500 });
  }
}
