const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [ true, '請輸入您的名字' ]
        },
        email: {
            type: String,
            required: [ true, '請輸入您的 Email' ],
            unique: true,
            lowercase: true,
            select: false
        },
        photo: String,
        gender: {
            type: String,
            required: [ true, '請選擇您的性別' ],
            enum: {
                values: [ 'female', 'male', 'secret' ],
                message: '性別格式不正確'
            }
        },
        password: {
            type: String,
            required: [ true, '請輸入您的密碼' ],
            minlength: 8,
            select: false
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        versionKey: false
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;