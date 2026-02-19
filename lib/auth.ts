import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider  from "next-auth/providers/credentials";
import prisma from "./db";
import { compare } from "bcrypt";

export const AuthOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
    },
    pages:{
        signIn: '/login',
    },
    providers: [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Username", type: "text", placeholder: "jsmith" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if(!credentials?.email || !credentials?.password){
        return null;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: credentials?.email}
      });
      if(!existingUser){
        return null;
      }

      const validatePassword = await compare(credentials.password, existingUser.password);

      if(!validatePassword){
        return null;
      }

      return{
        id: `${existingUser.id_user}`,
        email: existingUser.email,
        role: existingUser.role,
      }
    }
  })
],
callbacks: {
    async jwt({token, user}) {
        if (user) {
            token.role = user.role;
        }
        return token;
    },
    async session({session, token}) {
        if(session.user){
            session.user.role = token.role;
        }
        return session;
    }
}
}