"use client"
import { useState } from "react";
import LoginPage from "./(auth)/login/page";

export interface UserData{
  email: string;
  name?: string;
  password: string;
  role: string;
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);

  if (!user){
      return <LoginPage setUser={ setUser }/>
    }

  return (
    <div></div>
  );
}
