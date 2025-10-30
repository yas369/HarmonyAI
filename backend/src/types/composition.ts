export interface GenerateRequestBody {
  lyrics: string;
  emotion: string;
  genre: string;
  tempo: number;
}

export interface ComposerResponse {
  audio: string;
  midi: string;
  pdf: string;
}

export interface GenerateResponse {
  audio: string;
  midi: string;
  pdf: string;
}
