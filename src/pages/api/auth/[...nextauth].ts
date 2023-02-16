import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { checkPassword } from '../../../lib/authentication';

export default NextAuth({
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {},
      async authorize (credentials, req) {
        const { password } = credentials as { password: string };

        if (await checkPassword(password)) {
          return {
            id: '',
            email: ""
          };
        }

        return null;
      },
    })
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout"
  }
});