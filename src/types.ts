export interface Drama {
  title: string;
  book_id: string | null;
  image: string;
  views: string;
  episodes: string;
}

export interface ApiResponse {
  success: boolean;
  status: number;
  author: string;
  data: {
    latest: Drama[];
  };
}

export interface Episode {
  episode: number;
  id: string;
}

export interface DramaDetail {
  book_id: string;
  title: string;
  description: string;
  thumbnail: string;
  upload_date: string;
  stats: {
    total_episodes: string;
  };
  episode_list: Episode[];
}

export interface DetailResponse {
  success: boolean;
  status: number;
  author: string;
  data: DramaDetail;
}

export interface StreamData {
  book_id: string;
  episode: string;
  video_url: string;
}

export interface StreamResponse {
  success: boolean;
  status: number;
  author: string;
  data: StreamData;
}

