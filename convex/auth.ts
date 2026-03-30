import { convexAuth } from "@convex-dev/auth/server"
import { ResendOTP } from "./ResendOTP"
import { Password } from "@convex-dev/auth/providers/Password"
import Google from "@auth/core/providers/google"
import Twitter from "@auth/core/providers/twitter"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP, Password({ reset: ResendOTP, verify: ResendOTP }), Google, Twitter],
})
