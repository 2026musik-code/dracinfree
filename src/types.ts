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
