// import { v4 as uuidv4 } from "uuid"
// import cookieParser from 'cookie-parser'
import WebSocket from "ws"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

import User from "../models/testUsersModel"

interface WebSocketWithUUID extends WebSocket {
  uuid: string
}

// 邀請訊息
const Invite = mongoose.model(
  "Invite",
  new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, enum: ["sent", "accepted", "rejected"], default: "sent" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  })
)

// 聊天訊息
const Chat = mongoose.model(
  "Chat",
  new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  })
)

const wss1 = new WebSocket.WebSocketServer({ noServer: true })

wss1.on("connection", async function connection (ws, req) {
  ws.on("error", console.error)
  console.log("後端ws，3000port 連線成功 ...")

  // 取得用戶資料
  // const uuid = uuidv4()
  let uuid = ""
  let name = ""
  let photo = ""
  // 從cookie中取得token ，在同一個瀏覽器要登入塞入cookie
  function getRawHeaders () {
    return req.rawHeaders.join("; ")
  }
  async function getToken () {
    try {
      const headers = await getRawHeaders()
      const tokenPair = headers.split("; ").find(pair => pair.startsWith("104social_token="))
      const token = tokenPair ? tokenPair.split("=")[1] : null

      if (token) {
        if (!process.env.JWT_SECRET) {
          console.error("JWT_SECRET is not set")
          return
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        if (typeof decoded === "object" && "id" in decoded && "name" in decoded && "photo" in decoded) {
          uuid = decoded.id
          name = decoded.name
          photo = decoded.photo
        } else {
          console.error("Invalid token payload")
        }
      }
    } catch (error) {
      console.error("Failed to get token:", error)
    }
  }
  await getToken()

  // 判斷是哪一個用戶使用
  const wsWithUUID = ws as WebSocketWithUUID
  wsWithUUID.uuid = uuid
  // 發出第一個訊息給用戶，表示用戶是誰
  const user = {
    context: "user",
    uuid
  }
  // 發訊息給用戶 只能發送字串
  ws.send(JSON.stringify(user))

  // 發送資料庫中歷史訊息
  const invites = await Invite.find({ to: uuid }).populate({ path: "from", select: "name photo" })
  invites.forEach((invite: any) => {
    const inviteMessage = {
      context: "invite",
      from: invite.from._id,
      name: invite.from.name,
      photo: invite.from.photo,
      createdAt: invite.createdAt
    }
    ws.send(JSON.stringify(inviteMessage))
  })

  const chats = await Chat.find({ $or: [{ from: uuid }, { to: uuid }] }).populate({ path: "from", select: "name photo" }).populate({ path: "to", select: "name photo" })
  chats.forEach((chat: any) => {
    const chatMessage = {
      context: "message",
      content: chat.content,
      uuid: chat.from._id,
      name: chat.from.name,
      photo: chat.from.photo,
      createdAt: chat.createdAt
    }
    ws.send(JSON.stringify(chatMessage))
  })

  // 監聽前端各種傳訊行為
  ws.on("message", async (message: string) => {
    const msg = JSON.parse(message)

    if (msg.context === "invite") {
      const inviteMessage = {
        context: "invite",
        from: uuid,
        to: msg.to,
        name,
        photo,
        createdAt: new Date()
      }
      // 發送邀請給指定的用戶(不能隨意id，前端會判斷是否與本身相符)
      sendToUser(msg.to, inviteMessage, msg.from)

      // 嘗試查找邀請
      let invite = await Invite.findOne({ from: uuid, to: msg.to })
      if (!invite) {
        invite = new Invite({ from: uuid, to: msg.to, status: "sent", createdAt: new Date() })
        await invite.save()
      } else {
        await Invite.deleteOne({ _id: invite._id })
      }
    }

    if (msg.context === "message") {
      const newMessage = {
        context: "message",
        content: msg.content,
        uuid,
        name,
        photo,
        createdAt: new Date()
      }

      // 直接回傳
      // ws.send(JSON.stringify(newMessage))
      // sendAllUser(newMessage)
      sendToUser(msg.to, newMessage, msg.from)

      // 儲存聊天訊息
      const chat = new Chat({ from: uuid, to: msg.to, content: msg.content })
      await chat.save()
    }
  })
})

// 推播"大家"
function sendAllUser (msg: any) {
  wss1.clients.forEach(function (client: WebSocket) {
    // 已建立連線：並且排除自身 && client.uuid !== msg.uuid  > 不排除自己，因需要顯示自己的訊息
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg))
    }
  })
}

// 推播"特定用戶"
function sendToUser (uuid: string, msg: any, from: string) {
  (wss1.clients as Set<WebSocketWithUUID>).forEach(function (client: WebSocketWithUUID) {
    // 已建立連線：並且是指定的用戶
    if (client.readyState === WebSocket.OPEN && (client.uuid === uuid || client.uuid === from)) {
      client.send(JSON.stringify(msg))
    }
  })
}

export default wss1
