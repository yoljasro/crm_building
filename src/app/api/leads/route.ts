import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, Lead } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, name, phone, source, type, budget, rooms, status, agent } = body;

    const db = readDB();

    if (action === 'delete') {
      db.leads = db.leads.filter(lead => lead.id !== id);
      writeDB(db);
      return NextResponse.json({ success: true, message: "Lid muvaffaqiyatli o'chirildi" });
    }

    if (action === 'update' || id) {
      const index = db.leads.findIndex(lead => lead.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Lid topilmadi" }, { status: 404 });
      }

      db.leads[index] = {
        ...db.leads[index],
        name: name !== undefined ? name : db.leads[index].name,
        phone: phone !== undefined ? phone : db.leads[index].phone,
        source: source !== undefined ? source : db.leads[index].source,
        type: type !== undefined ? type : db.leads[index].type,
        budget: budget !== undefined ? Number(budget) : db.leads[index].budget,
        rooms: rooms !== undefined ? Number(rooms) : db.leads[index].rooms,
        status: status !== undefined ? status : db.leads[index].status,
        agent: agent !== undefined ? agent : db.leads[index].agent,
      };

      writeDB(db);
      return NextResponse.json({ success: true, data: db.leads[index] });
    }

    const newLead: Lead = {
      id: String(Date.now()),
      name: name || "Yangi Lid",
      phone: phone || "",
      source: source || "Telegram",
      type: type || "ijara",
      budget: Number(budget) || 0,
      rooms: Number(rooms) || 1,
      status: status || "yangi",
      agent: agent || "Admin",
      date: new Date().toISOString().split('T')[0]
    };

    db.leads.push(newLead);
    writeDB(db);

    return NextResponse.json({ success: true, data: newLead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
