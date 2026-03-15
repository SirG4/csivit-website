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
            "+password",
          );

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect();

        if (account?.provider === "google" || account?.provider === "github") {
          const oauthEmail = (
            user?.email ||
            profile?.email ||
            ""
          ).toLowerCase();

          // OAuth providers can return no email (e.g. private GitHub email).
          if (!oauthEmail) {
            return "/login?error=OAuthEmailMissing";
          }

          const image =
            account.provider === "google"
              ? profile?.picture
              : profile?.avatar_url;

          const fallbackName = oauthEmail.split("@")[0] || "User";

          // Check if user exists
          let existingUser = await User.findOne({ email: oauthEmail });

          if (!existingUser) {
            // Create new user from OAuth
            existingUser = await User.create({
              name: user?.name || profile?.name || fallbackName,
              email: oauthEmail,
              provider: account.provider,
              providerId: account.providerAccountId,
              image: image,
            });
          } else {
            // Link existing user account with current OAuth provider when possible.
            const updateData = {};

            if (
              !existingUser.providerId ||
              existingUser.provider === account.provider
            ) {
              updateData.provider = account.provider;
              updateData.providerId = account.providerAccountId;
            }

            if (!existingUser.image && image) {
              updateData.image = image;
            }

            if (!existingUser.name && (user?.name || profile?.name)) {
              updateData.name = user?.name || profile?.name;
            }

            if (Object.keys(updateData).length > 0) {
              existingUser = await User.findByIdAndUpdate(
                existingUser._id,
                updateData,
                { new: true },
              );
            }

            if (!existingUser) {
              return "/login?error=OAuthUserLinkFailed";
            }
          }

          if (!existingUser?._id) {
            return "/login?error=OAuthUserCreateFailed";
          }

          user.id = existingUser._id.toString();
          user.email = existingUser.email;
          user.name = existingUser.name;
          user.image = existingUser.image;
          user.role = existingUser.role;
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return "/login?error=OAuthSigninFailed";
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Ensure we have the latest role from DB for middleware protection
      if (token.id) {
        try {
          await dbConnect();
          const dbUser = await User.findById(token.id).select("role");
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch (error) {
          // Fallback to existing token role if DB check fails
          console.error("JWT role sync error:", error);
        }
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
          session.user.role = user.role;
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
