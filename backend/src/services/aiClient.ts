import axios from "axios";

import { config } from "../config/env";
import { ComposerResponse, GenerateRequestBody } from "../types/composition";

export async function requestComposition(
  payload: GenerateRequestBody
): Promise<ComposerResponse> {
  const response = await axios.post<ComposerResponse>(
    `${config.aiServiceUrl}/compose`,
    payload,
    {
      timeout: 60000,
    }
  );

  return response.data;
}
