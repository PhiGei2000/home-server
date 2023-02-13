import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {

      },
      authorize: async (credentials, req) => {
        const res = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        });

        const user = await res.json();

        if (res.ok && user) {
          return user;
        }

        return null;
      },
    })
  ],
  pages: {
    signIn: "/login"
  }
});