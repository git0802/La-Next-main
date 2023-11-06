import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from 'next-auth/providers/azure-ad';


export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: "961453528149-e87sfl14jka15svdnv4o5s56fud4fmvj.apps.googleusercontent.com",
      clientSecret: "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",
    }),
    AzureADProvider({
      clientId: "7e8b2738-c05c-4fb3-a3ea-071f29e78c0d",
      clientSecret: "w1H8Q~DmAUwv2lyG~C.luEzPKIg1p4IUy.Tp3cVj",
      tenantId: "ae91f1c5-597e-45c7-b984-088d1027ff42",
    },),
  ],
  secret: "learnanything",
};
//@ts-ignore
export default NextAuth(authOptions);
