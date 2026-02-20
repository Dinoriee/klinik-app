import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hash } from "bcrypt";


export async function POST(req: Request) {
   try{
    const body = await req.json();
    const {email, password, name, role} = body;

    const user = await prisma.user.findUnique({
        where: {email: email}
    });
    if(user){
        return NextResponse.json({user: null, message: "User already exist!"})
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role,
        }
    })
    return NextResponse.json({user: newUser, message: "User created successfully"}, {status: 201});
   } catch(error){
        return NextResponse.json({message:"Something went wrong."}, {status: 500});
   } 
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, name, id_user } = body;

    const user = await prisma.user.findUnique({
      where: { id_user },
      include: { tenagaMedis: true }
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {
      email,
      name,
    };

    if (user.tenagaMedis) {
      updateData.tenagaMedis = {
        update: {
          nama_tenaga_medis: name,
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id_user },
      data: updateData,
    });

    return NextResponse.json(
      { user: updatedUser, message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try{
        const { id_user } =await request.json();

        await prisma.user.delete({
            where: {id_user: Number(id_user)}
        });

        return NextResponse.json({message: "User dihapus"});
    }catch(error){
        return NextResponse.json({error: "Gagal dihapus"}, {status: 500});
    }
}