import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, RentalObject } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json({ success: true, data: db.objects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, name, district, address, price, rooms, area, floor, repair, status, image, description, ownerId } = body;

    const db = readDB();

    if (action === 'delete') {
      db.objects = db.objects.filter(obj => obj.id !== id);
      writeDB(db);
      return NextResponse.json({ success: true, message: "Obyekt muvaffaqiyatli o'chirildi" });
    }

    if (action === 'update' || id) {
      // Find and update
      const index = db.objects.findIndex(obj => obj.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Obyekt topilmadi" }, { status: 404 });
      }

      db.objects[index] = {
        ...db.objects[index],
        name: name !== undefined ? name : db.objects[index].name,
        district: district !== undefined ? district : db.objects[index].district,
        address: address !== undefined ? address : db.objects[index].address,
        price: price !== undefined ? Number(price) : db.objects[index].price,
        rooms: rooms !== undefined ? Number(rooms) : db.objects[index].rooms,
        area: area !== undefined ? Number(area) : db.objects[index].area,
        floor: floor !== undefined ? floor : db.objects[index].floor,
        repair: repair !== undefined ? repair : db.objects[index].repair,
        status: status !== undefined ? status : db.objects[index].status,
        image: image !== undefined ? image : db.objects[index].image,
        description: description !== undefined ? description : db.objects[index].description,
        ownerId: ownerId !== undefined ? ownerId : db.objects[index].ownerId,
      };

      writeDB(db);
      return NextResponse.json({ success: true, data: db.objects[index] });
    }

    // Otherwise, create new
    const newObject: RentalObject = {
      id: String(Date.now()),
      name: name || "Yangi Obyekt",
      district: district || "Mirabad",
      address: address || "",
      price: Number(price) || 0,
      rooms: Number(rooms) || 1,
      area: Number(area) || 0,
      floor: floor || "1/1",
      repair: repair || "O'rtacha",
      status: status || "bo'sh",
      image: image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
      description: description || "",
      ownerId: ownerId || "1",
      createdAt: new Date().toISOString()
    };

    db.objects.push(newObject);
    writeDB(db);

    return NextResponse.json({ success: true, data: newObject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
