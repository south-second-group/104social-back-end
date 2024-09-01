import express from "express"
import friendListController from "../controllers/friendListController"
import { checkAuth } from "../service/auth"

const router = express.Router()

router.post("/:friendId",
  checkAuth,
  /**
     * #swagger.tags = ['friend list']
     * #swagger.description = '新增好友'
    */
  friendListController.addFriend)

router.delete("/remove/:friendId", checkAuth,
  /**
     * #swagger.tags = ['friend list']
     * #swagger.description = '刪除好友'
    */
  friendListController.removeFriend)

router.get("/", checkAuth,
  /**
     * #swagger.tags = ['friend list']
     * #swagger.description = '取得好友列表'
    */
  friendListController.getFriendList)

export default router
