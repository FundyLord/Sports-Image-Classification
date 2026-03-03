export interface User {
  id: number;
  username: string;
}

export interface Sighting {
  id: number;
  sport: string;
  confidence: number;
  lat: number;
  lng: number;
  user: string;
  image_url: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
}
