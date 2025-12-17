import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcryptjs from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await dbConnect();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Invalid credentials");
          }

          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect();

        if (account?.provider === "google" || account?.provider === "github") {
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user from OAuth
            const image =
              account.provider === "google"
                ? profile?.picture
                : profile?.avatar_url;

            existingUser = await User.create({
              name: user.name,
              email: user.email,
              provider: account.provider,
              providerId: account.providerAccountId,
              image: image,
            });
          } else if (!existingUser.providerId) {
            // Update existing credentials user with OAuth info
            const image =
              account.provider === "google"
                ? profile?.picture
                : profile?.avatar_url;

            existingUser = await User.findByIdAndUpdate(
              existingUser._id,
              {
                provider: account.provider,
                providerId: account.providerAccountId,
                image: image,
              },
              { new: true }
            );
          }

          user.id = existingUser._id.toString();
          user.image = existingUser.image;
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      try {
        await dbConnect();

        const user = await User.findById(token.id);

        if (user) {
          session.user.id = user._id.toString();
          session.user.name = user.name;
          session.user.email = user.email;
          session.user.image = user.image;
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
