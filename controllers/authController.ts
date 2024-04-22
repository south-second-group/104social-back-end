import handleErrorAsync from "../service/handleErrorAsync"
import passport from "passport"

export const authController = {
  google: {
    auth: handleErrorAsync(async (req, res, next) => {
      passport.authenticate("google", {
        scope: ["profile", "email"]
      })(req, res, next)
    }),
    execCallback: handleErrorAsync(async (req, res, next) => {
      passport.authenticate(
        "google"
        // , { session: false } // session: false 會讓 req.user 為空
      )(req, res, next)
    })
  }
}
