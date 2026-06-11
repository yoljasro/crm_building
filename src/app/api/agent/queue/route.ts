import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json({ success: false, error: "managerId is required" }, { status: 400 });
    }

    const db = readDB();
    db.agentQueue = db.agentQueue || [];
    
    // Find the first pending call for this manager
    const pendingItemIndex = db.agentQueue.findIndex(
      item => item.managerId === Number(managerId) && item.status === "pending"
    );

    if (pendingItemIndex === -1) {
      return NextResponse.json({ success: true, data: null }); // No pending calls
    }

    const pendingItem = db.agentQueue[pendingItemIndex];
    // Mark it as processing
    pendingItem.status = "processing";
    db.agentQueue[pendingItemIndex] = pendingItem;
    writeDB(db);

    return NextResponse.json({ success: true, data: pendingItem });
  } catch (error) {
    console.error("Error fetching agent queue:", error);
    return NextResponse.json({ success: false, error: "Server xatosi" }, { status: 500 });
  }
}
