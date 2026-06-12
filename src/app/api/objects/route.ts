import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, RentalObject } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const db = readDB();

    // 1. Fetch specific IDs if requested
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',');
      const selected = db.objects.filter(obj => ids.includes(obj.id));
      return NextResponse.json({ success: true, data: selected });
    }

    // 2. Fetch specific single ID if requested
    const id = searchParams.get('id');
    if (id) {
      const obj = db.objects.find(o => o.id === id);
      if (!obj) {
        return NextResponse.json({ success: false, error: "Obyekt topilmadi" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: obj });
    }

    // 3. Project fields if requested
    const fieldsParam = searchParams.get('fields');
    if (fieldsParam) {
      const fields = fieldsParam.split(',');
      const projected = db.objects.map(obj => {
        const item: any = {};
        fields.forEach(f => {
          item[f] = (obj as any)[f];
        });
        item.id = obj.id;
        return item;
      });
      return NextResponse.json({ success: true, data: projected });
    }

    // 4. Otherwise, filter and paginate
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const district = searchParams.get('district') || 'Barchasi';
    const search = searchParams.get('search') || '';
    const priceMin = searchParams.get('priceMin') || '';
    const priceMax = searchParams.get('priceMax') || '';
    const rooms = searchParams.get('rooms') || '';
    const areaMin = searchParams.get('areaMin') || '';
    const areaMax = searchParams.get('areaMax') || '';
    const status = searchParams.get('status') || 'Barchasi';

    let filtered = db.objects;

    // Filter by district
    if (district !== 'Barchasi') {
      const selDist = district.toLowerCase().trim();
      filtered = filtered.filter(obj => {
        const objDist = (obj.district || "").toLowerCase().trim();
        if (selDist === "mirabad" && (objDist.includes("mirabad") || objDist.includes("мирабад"))) return true;
        if (selDist === "yakkasaray" && (objDist.includes("yakkasaray") || objDist.includes("яккасарай"))) return true;
        if (selDist === "tashkent city" && (objDist.includes("tashkent city") || objDist.includes("ташкент сити") || objDist.includes("city"))) return true;
        if (selDist === "shaykhantakhur" && (objDist.includes("shaykhantakhur") || objDist.includes("шайхантахур") || objDist.includes("shayxontohur"))) return true;
        if (selDist === "yunusabad" && (objDist.includes("yunusabad") || objDist.includes("юнусабад"))) return true;
        if (selDist === "chilanzar" && (objDist.includes("chilanzar") || objDist.includes("чиланзар"))) return true;
        if (selDist === "mirzo ulugbek" && (objDist.includes("mirzo") || objDist.includes("мирзо") || objDist.includes("уluгбек") || objDist.includes("ulugbek"))) return true;
        return objDist.includes(selDist);
      });
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(obj => 
        (obj.name?.toLowerCase() ?? "").includes(q) ||
        (obj.address?.toLowerCase() ?? "").includes(q) ||
        (obj.district?.toLowerCase() ?? "").includes(q) ||
        (obj.description?.toLowerCase() ?? "").includes(q)
      );
    }

    // Min price
    if (priceMin !== '') {
      filtered = filtered.filter(obj => obj.price >= Number(priceMin));
    }
    // Max price
    if (priceMax !== '') {
      filtered = filtered.filter(obj => obj.price <= Number(priceMax));
    }
    // Rooms
    if (rooms !== '') {
      filtered = filtered.filter(obj => obj.rooms === Number(rooms));
    }
    // Min area
    if (areaMin !== '') {
      filtered = filtered.filter(obj => obj.area >= Number(areaMin));
    }
    // Max area
    if (areaMax !== '') {
      filtered = filtered.filter(obj => obj.area <= Number(areaMax));
    }
    // Status
    if (status !== 'Barchasi') {
      filtered = filtered.filter(obj => obj.status === status);
    }

    // Total filtered count
    const total = filtered.length;

    // Sort by createdAt descending
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      total,
      page,
      limit
    });
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
