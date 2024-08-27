import mongoose, { Schema, type Document } from "mongoose"

export interface IFriendList extends Document {
  user: Schema.Types.ObjectId
  friends: Schema.Types.ObjectId[]
}

const friendListSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
})

export default mongoose.model<IFriendList>("FriendList", friendListSchema)
