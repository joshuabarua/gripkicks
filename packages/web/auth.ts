// import NextAuth from "next-auth";
// // import {GoogleProvider, CredentialsProvider, GithubProvider } from "next-auth/providers/";
// import Credentials from "next-auth/providers/credentials";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//     providers: [
//         Credentials({
//             credentials: {
//                 email: { label: "Email", type: "email", placeholder: "Email" },
//                 password: { label: "Password", type: "password", placeholder: "Password" },
//             },
//             async authorize(credentials) {
//                 let user = null;

//                 user = { id: "1", name: "admin", email:"jo@jo.com" };

//                 if (!user) {
//                     console.log("Invalid Credentials")
//                     return null;
//                 }
//                 return user;
//             }
//         })
//         // GoogleProvider({
//         //     clientId: process.env.GOOGLE_CLIENT_ID as string,
//         //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//         // }),
//     ],
// })