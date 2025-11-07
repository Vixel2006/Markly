import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:8080/api/auth/login", {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        })

        if (!res.ok) {
          const errorBody = await res.text();
          console.error("Backend login error:", res.status, errorBody);
          return null; // Or throw an error with a more specific message
        }

        const contentType = res.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
          const errorBody = await res.text();
          console.error("Backend login response is not JSON:", errorBody);
          return null; // Or throw an error
        }

        let user;
        try {
          user = await res.json();
        } catch (jsonError) {
          console.error("Error parsing backend login response as JSON:", jsonError);
          const errorBody = await res.text();
          console.error("Raw backend response:", errorBody);
          return null;
        }

        if (user && user.token) { // Assuming the backend returns a 'token' field in the user object
          return { ...user, accessToken: user.token };
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken; // Store the access token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.accessToken = token.accessToken; // Expose the access token in the session
      return session;
    }
  }
}

export default NextAuth(authOptions)

export const GET = NextAuth(authOptions)
export const POST = NextAuth(authOptions)
