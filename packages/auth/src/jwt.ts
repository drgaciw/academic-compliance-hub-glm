import { JWT } from "next-auth/jwt";
import { Role } from "./permissions";

export interface ExtendedJWT extends JWT {
  id: string;
  role: Role;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export const TOKEN_EXPIRY_WINDOW = 5 * 60 * 1000;

export async function refreshAccessToken(
  token: ExtendedJWT,
): Promise<ExtendedJWT | null> {
  try {
    if (!token.refreshToken) {
      console.error("No refresh token available");
      return null;
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("Failed to refresh access token:", refreshedTokens);
      return null;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token || token.refreshToken,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

export async function refreshMicrosoftAccessToken(
  token: ExtendedJWT,
): Promise<ExtendedJWT | null> {
  try {
    if (!token.refreshToken) {
      console.error("No refresh token available");
      return null;
    }

    const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
    const response = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID || "",
          client_secret: process.env.MICROSOFT_CLIENT_SECRET || "",
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        }),
      },
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error(
        "Failed to refresh Microsoft access token:",
        refreshedTokens,
      );
      return null;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token || token.refreshToken,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error("Error refreshing Microsoft access token:", error);
    return null;
  }
}

export async function autoRefreshToken(
  token: ExtendedJWT,
  provider: string = "google",
): Promise<ExtendedJWT | null> {
  const now = Date.now();
  const expiresAt = token.expiresAt || 0;

  if (!token.accessToken) {
    return token;
  }

  if (expiresAt - now > TOKEN_EXPIRY_WINDOW) {
    return token;
  }

  if (provider === "google") {
    return await refreshAccessToken(token);
  } else if (provider === "azure-ad") {
    return await refreshMicrosoftAccessToken(token);
  }

  return token;
}

export function isTokenExpiringSoon(token: ExtendedJWT): boolean {
  const now = Date.now();
  const expiresAt = token.expiresAt || 0;
  return expiresAt - now < TOKEN_EXPIRY_WINDOW;
}

export function isTokenExpired(token: ExtendedJWT): boolean {
  const now = Date.now();
  const expiresAt = token.expiresAt || 0;
  return now >= expiresAt;
}

export function getTokenTimeToExpiry(token: ExtendedJWT): number {
  const now = Date.now();
  const expiresAt = token.expiresAt || 0;
  return Math.max(0, expiresAt - now);
}
