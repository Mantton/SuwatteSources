import {
  BasicAuthenticatable,
  BasicAuthenticationUIIdentifier,
  User,
} from "@suwatte/daisuke";
import { GET, POST } from "../network";

export const MDBasicAuthProvider: BasicAuthenticatable = {
  BasicAuthUIIdentifier: BasicAuthenticationUIIdentifier.USERNAME,
  async handleBasicAuth(username, password) {
    const response = await POST("/auth/login", {
      body: {
        username,
        password,
      },
    });
    const session = response.token.session;
    const refresh = response.token.refresh;

    await SecureStore.set("session", session);
    await SecureStore.set("refresh", refresh);
  },

  async getAuthenticatedUser() {
    const token = await SecureStore.get("session");
    if (!token) {
      return null;
    }

    const { data } = await GET(`/user/me`);

    const user: User = {
      handle: data.attributes.username,
      avatar: "https://mangadex.org/avatar.png",
    };

    return user;
  },

  async handleUserSignOut() {
    try {
      await GET(`/auth/logout`);
    } catch (err) {
      console.log(err);
    }
    await SecureStore.remove("session");
    await SecureStore.remove("refresh");
  },
};
