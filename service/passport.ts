import bcrypt from "bcryptjs"
import { type PassportStatic } from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"

import User from "../models/testUsersModel"
import { type UserInterface } from "../types/user"
// import { type ProfileInterface } from "../types/profile"

export default (passport: PassportStatic): void => {
  passport.serializeUser(function (
    user,
    done: (err: Error | null, id: object) => void
  ) {
    done(null, user)
  })

  passport.deserializeUser(function (
    userId: string,
    done: (error: Error | null, user?: object) => void
  ) {
    User.findById(userId, function (err: Error | null, user?: UserInterface) {
      done(err, user)
    }).catch((err: Error) => {
      console.error(err)
    })
  })

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID ?? "",
        clientSecret: process.env.GOOGLE_SECRET ?? "",
        callbackURL: process.env.GOOGLE_CALLBACK ?? ""
      },
      // eslint-disable-next-line
      async (
        accessToken: string,
        refreshToken: string,
        // eslint-disable-next-line
        profile: any,
        done: (error: Error | null, user?: UserInterface) => void
      ) => {
        const user: UserInterface | null = await User.findOne({
          email: profile._json.email
        })

        if (user !== null) {
          done(null, user)
        }
        if (user === null) {
          const randomPassword = Math.random().toString(36).slice(-8)
          bcrypt.genSalt(10, (err, salt) => {
            if (err !== null && err !== undefined) {
              console.error(err)
              return
            }

            // eslint-disable-next-line
            bcrypt.hash(randomPassword, salt, async (err, hash) => {
              if (err !== null && err !== undefined) {
                console.error(err)
              } else {
                try {
                  const newUser = await User.create({
                    name: profile._json.name,
                    email: profile._json.email,
                    photo: profile._json.picture ?? "",
                    gender: profile._json.gender ?? "secret",
                    password: hash,
                    googleId: profile.id
                  })
                  done(null, { ...newUser.toObject(), _id: newUser._id.toString() })
                } catch (err) {
                  console.error(err)
                }
              }
            })
          })
        }
      }
    )
  )
  //* eslint-disable @typescript-eslint/no-misused-promises
}
