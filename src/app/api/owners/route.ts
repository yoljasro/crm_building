import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, Owner } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    const ownersWithStats = db.owners.map(owner => {
      const ownerObjects = db.objects.filter(obj => obj.ownerId === owner.id);
      return {
        ...owner,
        objectsCount: ownerObjects.length,
        objects: ownerObjects.slice(0, 2).map(o => ({ id: o.id, name: o.name, price: o.price }))
      };
    });
    return NextResponse.json({ success: true, data: ownersWithStats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, name, phone, email, telegram, notes } = body;

    const db = readDB();

    if (action === 'delete') {
      db.owners = db.owners.filter(owner => owner.id !== id);
      writeDB(db);
      return NextResponse.json({ success: true, message: "Mulkdor muvaffaqiyatli o'chirildi" });
    }

    if (action === 'update' || id) {
      const index = db.owners.findIndex(owner => owner.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Mulkdor topilmadi" }, { status: 404 });
      }

      db.owners[index] = {
        ...db.owners[index],
        name: name !== undefined ? name : db.owners[index].name,
        phone: phone !== undefined ? phone : db.owners[index].phone,
        email: email !== undefined ? email : db.owners[index].email,
        telegram: telegram !== undefined ? telegram : db.owners[index].telegram,
        notes: notes !== undefined ? notes : db.owners[index].notes,
      };

      writeDB(db);
      return NextResponse.json({ success: true, data: db.owners[index] });
    }

    const newOwner: Owner = {
      id: String(Date.now()),
      name: name || "Yangi Mulkdor",
      phone: phone || "",
      email: email || "",
      telegram: telegram || "",
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    db.owners.push(newOwner);
    writeDB(db);

    return NextResponse.json({ success: true, data: newOwner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
