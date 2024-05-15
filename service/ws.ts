import WebSocket from "ws"
import { v4 as uuidv4 } from "uuid"

// const mongoose = require('mongoose');
// const Invite = mongoose.model(
//   'Invite',
//   new mongoose.Schema({
//     from: String,
//     to: String,
//     // ws.invites = []; // 儲存邀請的 UUID
//     // ws.invitedBy = []; // 儲存被邀請的 UUID
//   })
// );

const wss1 = new WebSocket.WebSocketServer({ noServer: true })

wss1.on("connection", function connection (ws) {
  ws.on("error", console.error)
  console.log("後端ws，3000port 連線成功 ...")
  const uuid = uuidv4()

  ws.uuid = uuid // 判斷是哪一個用戶使用

  // 發出第一個訊息給用戶，表示用戶是誰
  const user = {
    context: "user",
    uuid
  }
  // 發訊息給用戶
  ws.send(JSON.stringify(user)) // 只能發送字串

  // 監聽
  ws.on("message", async (message) => {
    const msg = JSON.parse(message)

    if (msg.context === "invite") {
      console.log("invite")

      const inviteMessage = {
        context: "invite",
        from: uuid,
        to: msg.to
      }

      // 發送邀請給指定的用戶
      sendToUser(msg.to, inviteMessage)
      // 寫入資料庫
      // await new Invite({ from: uuid, to: msg.to }).save();
    }

    if (msg.context === "message") {
      // console.log('message');

      const newMessage = {
        context: "message",
        uuid,
        content: msg.content
      }

      // 直接回傳
      // ws.send(JSON.stringify(newMessage))
      sendAllUser(newMessage)
    }
  })
})

// 推播大家
function sendAllUser (msg) {
  wss1.clients.forEach(function (client) {
    // 已建立連線：並且排除自身 && client.uuid !== msg.uuid
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg))
    }
  })
}

// 推播給特定用戶
function sendToUser (uuid, msg) {
  wss1.clients.forEach(function (client) {
    // 已建立連線：並且是指定的用戶
    if (client.readyState === WebSocket.OPEN && client.uuid === uuid) {
      client.send(JSON.stringify(msg))
    }
  })
}

module.exports = wss1
