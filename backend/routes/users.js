import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
const router = express.Router();
import User from '../models/user.model.js';
// 导入NodeCache库
import NodeCache from "node-cache";

import jwt from 'jsonwebtoken';
// 创建verificationCodeCache对象来存储验证码
const verificationCodeCache = new NodeCache();

router.post('/account/log', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: '用户不存在' });
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    return res.status(400).json({ error: '密码错误，请重新尝试' });
  }

  // 创建一个 jwt token 包含用户信息
  const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, 'your_secret_key');

  // 返回token
  return res.json({ message: '登陆成功', token });
});


router.post('/account/reg', async (req, res) => {
  const { username, password, email, verificationCode } = req.body;

  // 密码加密
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 检查用户名和邮箱是否已存在
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    return res.status(400).send('用户名或邮箱已存在');
  }

  // 验证验证码是否正确
  const storedVerificationCode = verificationCodeCache.get(email);
  if (!storedVerificationCode || verificationCode !== storedVerificationCode) {
    return res.status(400).send('验证码不正确');
  }

  // 创建新用户
  const newUser = new User({
    username,
    email,
    password: hashedPassword
  });

  // 保存用户并发送响应
  try {
    await newUser.save();
    res.status(201).send('用户创建成功');
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.get('/account/reg/email/getv', (req, res) => {
  const email = req.query.email;

  // Generate a random verification code
  let verificationCode = Math.floor(Math.random() * 1000000).toString();

  // 缓存验证码，有效期可根据实际需求设置
  verificationCodeCache.set(email, verificationCode, 600); 
  // Create transporter object using the SendGrid transport
  let transporter = nodemailer.createTransport(sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  }));

  // Send an email
  transporter.sendMail({
    from: process.env.EMAIL_USER, // sender address
    to: email, // list of receivers
    subject: "Verification Code", // Subject line
    html: `
    <p>亲爱的朋友，</p>
    <p>您的验证码是：${verificationCode}</p>
    <p>谢谢！</p>
  `
  }, (err, info) => {
    if(err){
      console.error('FAILED...', err);
      res.status(500).json({ error: err });
    } else {
      console.log('SUCCESS!', info.response);
      res.json({ success: true });
    }
  });
});

export default router;
