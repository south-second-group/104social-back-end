// import { v4 as uuidv4 } from "uuid"
import WebSocket from "ws"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import User from "../models/testUsersModel"

interface WebSocketWithUUID extends WebSocket {
  uuid: string
}

interface Message {
  context: string
}

interface ChatType {
  _id: object
  from: {
    _id: object
    name?: string
    photo?: string
  }
  to: {
    _id: object
  }
  content: string
  isRead: boolean
  createdAt: Date
}

/**
*   資料庫模組設定
*/
const Invite = mongoose.model(
  "Invite",
  new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["sendInvite", "accepted", "rejected"], default: "sendInvite" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  })
)

const Chat = mongoose.model(
  "Chat",
  new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  })
)

const wss = new WebSocket.WebSocketServer({ noServer: true })
// 取得用戶資料
let uuid = ""
let name = ""
let photo = ""
//  用於判斷是否為第一次連線
// let isFirstConnection = true

/**
*   連線設定
*/
wss.on("connection", async function connection (ws, req): Promise<void> {
  ws.on("error", console.error)

  // if (isFirstConnection) {
  console.warn("後端 WS，連線成功 (傳送歷史資料)")

  // 取得用戶令牌，解析用戶資料
  async function getToken (): Promise<void> {
    try {
      const url = typeof req.url === "string" && req.url.trim() !== "" ? new URL(req.url, `http://${req.headers.host}`) : null
      const token = url !== null ? url.searchParams.get("token") : null

      if (token !== null) {
        if (process.env.JWT_SECRET === null || process.env.JWT_SECRET === undefined) {
          console.error("JWT_SECRET is not set")
          return
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof decoded === "object" && "id" in decoded && "name" in decoded && "photo" in decoded) {
          uuid = decoded.id
          name = decoded.name
          photo = decoded.photo
        } else {
          console.error("Invalid token payload")
        }
      } else {
        console.error("Token is null")
      }
    } catch (error) {
      console.error("Failed to get token:", error)
    }
  }
  await getToken()

  if (!uuid) {
    console.error("UUID is empty")
    return
  }

  // 判斷是哪一個用戶使用
  const wsWithUUID = ws as WebSocketWithUUID
  wsWithUUID.uuid = uuid

  // 發出第一個訊息給用戶，表示用戶是誰
  const user = {
    context: "user",
    uuid,
    name
  }
  // 發訊息給用戶 (只能發送字串)
  ws.send(JSON.stringify(user))

  // 發送資料庫中歷史訊息
  const invites = await Invite.find({ $or: [{ from: uuid }, { to: uuid }] }).populate({ path: "from", select: "name photo" }).populate({ path: "to", select: "name photo" })
  // eslint-disable-next-line
    invites.forEach((invite: any) => {
    const inviteMessage = {
      id: invite._id,
      context: "invite",
      from: invite.from._id,
      to: invite.to,
      status: invite.status,
      name: invite.from.name,
      photo: invite.from.photo,
      createdAt: invite.createdAt
    }
    ws.send(JSON.stringify(inviteMessage))
  })

  const chats = await Chat.find({ $or: [{ from: uuid }, { to: uuid }] }).populate({ path: "from", select: "name photo" }).populate({ path: "to", select: "name photo" })
  chats.forEach((chat: ChatType) => {
    const chatMessage = {
      id: chat._id,
      context: "oldMessage",
      content: chat.content,
      uuid: chat?.from?._id,
      name: chat.from?.name,
      photo: chat.from?.photo,
      createdAt: chat.createdAt,
      toId: chat?.to?._id,
      isRead: chat.isRead
    }
    ws.send(JSON.stringify(chatMessage))
  })

  // isFirstConnection = false
  // }
})

/**
* 監聽 "前端" 各種傳訊行為
*/
wss.on("connection", async function connection (ws, _req) {
  ws.on("message", async (message: string) => {
    // 前端傳過來的整包物件
    const msg = JSON.parse(message)

    // 邀請行為
    if (msg.context === "invite") {
      if (msg.to === uuid) {
        console.error("邀請失敗，不能邀請自己")
        // return
      }

      const toUser = await User.findById(msg.to)

      const inviteMessage = {
        id: new mongoose.Types.ObjectId(),
        context: "invite",
        from: uuid,
        to: toUser,
        status: msg.status,
        name,
        photo,
        createdAt: new Date()
      }

      // 發送邀請給指定的用戶(不能隨意id，前端會判斷是否與本身相符)
      sendToUser(String(msg.to), inviteMessage, String(msg.from))

      // 嘗試查找邀請
      let invite = await Invite.findOne({ from: uuid, to: msg.to })
      if (invite === null) {
        if (msg.status === "sendInvite") {
          invite = new Invite({ from: uuid, to: msg.to, status: "sendInvite", createdAt: new Date() })
          await invite.save()
          return
        }

        if (msg.status === "rejected") {
          invite = new Invite({ from: uuid, to: msg.to, status: "rejected", createdAt: new Date() })
        }

        if (msg.status === "accepted") {
          // invite = new Invite({ from: uuid, to: msg.to, status: "accepted", createdAt: new Date() })
          invite = await Invite.findOneAndUpdate({ from: uuid, to: msg.to }, { status: "accepted", updatedAt: new Date() })
        }
      } else {
        await Invite.deleteOne({ _id: invite._id })
        return
      }
    }

    // 訊息行為
    if (msg.context === "message") {
      console.warn("後端 WS，連線成功 (傳送即時訊息或邀請)")

      const newMessage = {
        id: new mongoose.Types.ObjectId(),
        context: "message",
        content: msg.content,
        uuid,
        name,
        photo,
        toId: msg.to,
        isRead: false,
        createdAt: new Date()
      }

      sendToUser(String(msg.to), newMessage, String(msg.from))

      // 儲存聊天訊息
      const chat = new Chat({ from: uuid, to: msg.to, content: msg.content })
      await chat.save()
    }

    // 已讀行為
    if (msg.context === "read") {
      // 設定已讀
      (wss.clients as Set<WebSocketWithUUID>).forEach(function (client: WebSocketWithUUID) {
        if (client.readyState === WebSocket.OPEN && (client.uuid === msg.to || client.uuid === msg.from)) {
          msg.isRead = true
        }
      })

      await Chat.updateMany(
        { to: msg.to, from: msg.from },
        { $set: { isRead: true } }
      )
    }
  })
})

/**
*   相關函式
*/

// 推播"大家" 暫無使用
// eslint-disable-next-line
function sendAllUser (msg: Message): void {
  wss.clients.forEach(function (client: WebSocket) {
    // 已建立連線：並且排除自身 && client.uuid !== msg.uuid  > 不排除自己，因需要顯示自己的訊息
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg))
    }
  })
}

// 推播"特定用戶"
function sendToUser (uuid: string, msg: Message, from: string): void {
  (wss.clients as Set<WebSocketWithUUID>).forEach(function (client: WebSocketWithUUID) {
    // 已建立連線：並且是指定的用戶
    if (client.readyState === WebSocket.OPEN && (client.uuid === uuid || client.uuid === from)) {
      client.send(JSON.stringify(msg))
    }
  })
}

export default wss
