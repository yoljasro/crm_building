import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, CallLog } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.calls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, leadId, ownerId, operator, duration, status, notes } = body;

    const db = readDB();

    if (action === 'delete') {
      db.calls = db.calls.filter(call => call.id !== id);
      writeDB(db);
      return NextResponse.json({ success: true, message: "Qo'ng'iroq muvaffaqiyatli o'chirildi" });
    }

    const newCall: CallLog = {
      id: String(Date.now()),
      leadId: leadId || undefined,
      ownerId: ownerId || undefined,
      operator: operator || "Admin",
      duration: Number(duration) || 0,
      status: status || "javob_berildi",
      notes: notes || "",
      date: new Date().toISOString()
    };

    db.calls.unshift(newCall); // add to top
    writeDB(db);

    return NextResponse.json({ success: true, data: newCall });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
