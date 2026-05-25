import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, Task } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, title, description, deadline, status, operator } = body;

    const db = readDB();

    if (action === 'delete') {
      db.tasks = db.tasks.filter(task => task.id !== id);
      writeDB(db);
      return NextResponse.json({ success: true, message: "Vazifa muvaffaqiyatli o'chirildi" });
    }

    if (action === 'update' || id) {
      const index = db.tasks.findIndex(task => task.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Vazifa topilmadi" }, { status: 404 });
      }

      db.tasks[index] = {
        ...db.tasks[index],
        title: title !== undefined ? title : db.tasks[index].title,
        description: description !== undefined ? description : db.tasks[index].description,
        deadline: deadline !== undefined ? deadline : db.tasks[index].deadline,
        status: status !== undefined ? status : db.tasks[index].status,
        operator: operator !== undefined ? operator : db.tasks[index].operator,
      };

      writeDB(db);
      return NextResponse.json({ success: true, data: db.tasks[index] });
    }

    const newTask: Task = {
      id: String(Date.now()),
      title: title || "Yangi Vazifa",
      description: description || "",
      deadline: deadline || new Date().toISOString().split('T')[0],
      status: status || "kutilmoqda",
      operator: operator || "Admin",
      date: new Date().toISOString().split('T')[0]
    };

    db.tasks.push(newTask);
    writeDB(db);

    return NextResponse.json({ success: true, data: newTask });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
