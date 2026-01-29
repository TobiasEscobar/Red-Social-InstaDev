export interface User {
  _id: string;  // MongoDB ID
  id?: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  birthdate?: string;
  description?: string;
  profilePicture?: string;
  role: 'usuario' | 'administrador';
  createdAt?: string;
  
  // Campos opcionales o de auth
  sub?: string;
  cloudinaryPublicId?: string;
  active?: boolean;
}

export interface CreateUserDto {
  username: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}
