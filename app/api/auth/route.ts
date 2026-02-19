import { NextResponse } from "next/server";
import prisma from "@/lib/db";


export async function GET(req: Request) {
   try{
    const body = await req.json();
    const {email, password} = body;

    const user = await prisma.user.findUnique({
        where: {email: email}
    })
    if(!user){
        return NextResponse.json({user: null, message: "Us"})
    }
   } catch(error){
        return NextResponse.json({message:"Something went wrong."}, {status: 500});
   }
}