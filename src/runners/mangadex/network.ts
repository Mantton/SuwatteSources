import {
  NetworkClientBuilder,
  NetworkRequest,
  NetworkRequestConfig,
} from "@suwatte/daisuke";
import { API_URL } from "./constants";

const client = new NetworkClientBuilder()
  .setRateLimit(5, 1.25)
  .addRequestInterceptor(AuthInterceptor)
  .build();

async function AuthInterceptor(request: NetworkRequest) {
  let token: string | null = null;
  const chain = SecureStore;
  try {
    token = await chain.string("session");
  } catch (error) {
    console.log("Nested Object Reference Error");
    return request;
  }
  if (!token) return request;
  if (isTokenExpired(token)) {
    await refreshTokens();
    token = await chain.string("session");
    if (!token) {
      return request;
    }
  }
  request.headers = {
    ...request.headers,
    authorization: `Bearer ${token.trim()}`,
    referer: "https://mangadex.org",
  };

  return request;
}

const refreshTokens = async () => {
  const token = await SecureStore.string("refresh");
  const removeTokens = async () => {
    await SecureStore.remove("refresh");
    await SecureStore.remove("session");
  };

  if (!token) {
    await removeTokens();
    return;
  }
  if (isTokenExpired(token)) {
    await removeTokens();
    return;
  }
  // Refresh
  try {
    const client = new NetworkClient();
    const refreshResponse = await client.post(
      `https://api.mangadex.org/auth/refresh`,
      {
        body: {
          token,
        },
      }
    );
    const data = JSON.parse(refreshResponse.data);

    await SecureStore.set("session", data.token.session);
    await SecureStore.set("refresh", data.token.refresh);
  } catch {
    await removeTokens();
  }
  console.log("Refreshed Token");
};

export function isTokenExpired(token: string) {
  return (
    Date.now() >=
    JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).exp * 1000
  );
}

// GET & POST Methods
type JSONResponse = Record<string, any>;
export async function GET<T extends JSONResponse>(
  path: string,
  config?: NetworkRequestConfig
): Promise<T> {
  const url = `${API_URL}${path}`;
  const { data: response } = await client.get(url, config);
  const data = JSON.parse(response);
  return data as T;
}

export async function POST<T extends JSONResponse>(
  path: string,
  config?: NetworkRequestConfig
): Promise<T> {
  const { data: response } = await client.post(`${API_URL}${path}`, config);
  const data = JSON.parse(response);
  return data as T;
}
