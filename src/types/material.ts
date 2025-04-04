
export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  plan_level: string;
  file_url: string;
  thumbnail_url?: string;
  access_count?: number;
  type: "document" | "video" | "audio" | "presentation";
  created_at: string;
  updated_at: string;
}
