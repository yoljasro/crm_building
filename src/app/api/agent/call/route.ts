import { NextResponse } from 'next/server';
import { readDB, writeDB, AgentQueue } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { managerId, phone, targetId, targetModel } = await req.json();

    if (!managerId || !phone) {
      return NextResponse.json({ success: false, error: "managerId and phone are required" }, { status: 400 });
    }

    const db = readDB();
    
    const newQueueItem: AgentQueue = {
      id: crypto.randomUUID(),
      managerId: Number(managerId),
      phone,
      type: "call",
      status: "pending",
      targetId,
      targetModel,
      createdAt: new Date().toISOString()
    };

    db.agentQueue = db.agentQueue || [];
    db.agentQueue.push(newQueueItem);
    writeDB(db);

    return NextResponse.json({ success: true, data: newQueueItem });
  } catch (error) {
    console.error("Error creating agent call:", error);
    return NextResponse.json({ success: false, error: "Server xatosi" }, { status: 500 });
  }
}
