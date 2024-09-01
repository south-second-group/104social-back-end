import { type Request, type Response, type NextFunction } from "express"
import mongoose from "mongoose"
import User from "../models/testUsersModel"
import FriendList from "../models/friendListModel"
import handleErrorAsync from "../service/handleErrorAsync"
import appError from "../service/appError"
import { successHandler } from "../service/handler"

const friendListController = {
  addFriend: handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { friendId } = req.params // '66262004b4153047c691bb5b'
      const userId = req.user?._id

      if (!userId || !friendId) {
        appError("缺少必要參數", 400, next)
        return
      }

      if (!mongoose.Types.ObjectId.isValid(friendId)) {
        appError("請確認好友 ID 是否正確", 400, next)
        return
      }

      if (userId === friendId) {
        appError("無法加自己為好友", 400, next)
        return
      }

      const userObjectId = new mongoose.Types.ObjectId(userId.toString()) // 確保 userId 是有效的 ObjectId
      let friendList = await FriendList.findOne({ user: userObjectId })

      if (!friendList) {
        friendList = await FriendList.create({ user: userObjectId, friends: [] })
        await User.findByIdAndUpdate(userObjectId, { friendList: friendList._id })
      }

      // eslint-disable-next-line
      // @ts-ignore
      if (friendList.friends.includes(friendId)) {
        appError("該用戶已經是您的朋友", 400, next)
        return
      }

      // eslint-disable-next-line
      // @ts-ignore
      friendList.friends.push(friendId)
      await friendList.save()

      successHandler(res, "成功添加朋友", friendList)
    }
  ),

  removeFriend: handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { friendId } = req.params
      const userId = req.user?._id

      if (!userId || !friendId) {
        appError("缺少必要參數", 400, next)
        return
      }

      const userObjectId = new mongoose.Types.ObjectId(userId.toString()) // 確保 userId 是有效的 ObjectId
      const friendList = await FriendList.findOne({ user: userObjectId })

      if (!friendList) {
        appError("找不到好友列表", 404, next)
        return
      }

      // eslint-disable-next-line
      friendList.friends = friendList.friends.filter(id => id.toString() !== friendId)
      await friendList.save()

      successHandler(res, "成功移除朋友", friendList)
    }
  ),

  getFriendList: handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id

      if (!userId) {
        appError("缺少 userId", 400, next)
        return
      }

      let friendList = await FriendList.findOne({ user: userId }).populate(
        "friends",
        "name photo onlineStatus messageBoard "
      )

      if (!friendList) {
        friendList = await FriendList.create({ user: userId, friends: [] })
      }

      successHandler(res, "成功獲取好友列表", friendList)
    }
  )
}

export default friendListController
