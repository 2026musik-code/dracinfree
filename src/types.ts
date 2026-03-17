export interface Drama {
  title: string;
  book_id: string;
  cover: string;
  author: string;
  sinopsis: string;
  status: string;
  tags: string[];
  total_chapters: string;
}

export interface ApiResponse {
  success: boolean;
  status: number;
  author: string;
  result: Drama[];
}

export interface Episode {
  episode: number;
  video_id: string;
  title: string;
}

export interface DramaDetail {
  book_id: string;
  title: string;
  intro: string;
  cover: string;
  total_episodes: number;
  tags: string[];
  status: string;
  episodes: Episode[];
}

export interface DetailResponse {
  success: boolean;
  status: number;
  author: string;
  result: DramaDetail;
}

export interface StreamData {
  quality: string;
  size: number;
  fps: number;
  url: string;
}

export interface StreamResponse {
  success: boolean;
  status: number;
  author: string;
  result: StreamData[];
}


