// import { v4 as uuidv4 } from "uuid"
import WebSocket from "ws"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

// import User from "../models/testUsersModel"

interface WebSocketWithUUID extends WebSocket {
  uuid: string
}

interface Message {
  context: string
}

// interface ChatType {
//   content: string
//   from: {
//     _id: mongoose.Types.ObjectId
//     name: string
//     photo: string
//   }
//   to: {
//     _id: mongoose.Types.ObjectId
//     name: string
//     photo: string
//   }
//   createdAt: Date
// };

/**
*
*   模組設定
*
*/
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

/**
*
*   連線設定
*
*/
// eslint-disable-next-line
wss1.on("connection", async function connection (ws, req): Promise<void> {
  ws.on("error", console.error)
  console.warn("後端 WS，連線成功 ...")

  // 取得用戶資料
  // const uuid = uuidv4()
  let uuid = ""
  let name = ""
  let photo = ""

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
    uuid,
    name
  }
  // 發訊息給用戶 只能發送字串
  ws.send(JSON.stringify(user))

  // 發送資料庫中歷史訊息
  const invites = await Invite.find({ to: uuid }).populate({ path: "from", select: "name photo" })
  // eslint-disable-next-line
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
  // eslint-disable-next-line
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
  // eslint-disable-next-line
  ws.on("message", async (message: string): Promise<void> => {
    const msg = JSON.parse(message)

    // 邀請行為
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
      sendToUser(String(msg.to), inviteMessage, String(msg.from))

      // 嘗試查找邀請
      let invite = await Invite.findOne({ from: uuid, to: msg.to })
      if (invite === null) {
        invite = new Invite({ from: uuid, to: msg.to, status: "sent", createdAt: new Date() })
        await invite.save()
        return
      } else {
        await Invite.deleteOne({ _id: invite._id })
        return
      }
    }

    // 訊息行為
    if (msg.context === "message") {
      const newMessage = {
        context: "message",
        content: msg.content,
        uuid,
        name,
        photo,
        createdAt: new Date()
      }

      // 不處理直接回傳
      // ws.send(JSON.stringify(newMessage))
      // sendAllUser(newMessage)
      sendToUser(String(msg.to), newMessage, String(msg.from))

      // 儲存聊天訊息
      const chat = new Chat({ from: uuid, to: msg.to, content: msg.content })
      await chat.save()
    }
  })
})

/**
*
*   相關函式
*
*/

// 推播"大家" 暫無使用
// eslint-disable-next-line
function sendAllUser (msg: Message): void {
  wss1.clients.forEach(function (client: WebSocket) {
    // 已建立連線：並且排除自身 && client.uuid !== msg.uuid  > 不排除自己，因需要顯示自己的訊息
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg))
    }
  })
}

// 推播"特定用戶"
function sendToUser (uuid: string, msg: Message, from: string): void {
  (wss1.clients as Set<WebSocketWithUUID>).forEach(function (client: WebSocketWithUUID) {
    // 已建立連線：並且是指定的用戶
    if (client.readyState === WebSocket.OPEN && (client.uuid === uuid || client.uuid === from)) {
      client.send(JSON.stringify(msg))
    }
  })
}

export default wss1
