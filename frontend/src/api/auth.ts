import { api } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

export async function getCurrentUser(){
  const response = await api.get<{
    success: boolean;
    data: {
      user: AuthUser;
    };
  }>("/auth/me");

  return response.data.data.user;
}