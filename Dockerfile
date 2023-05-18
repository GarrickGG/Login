# 使用 Node.js 基础镜像
FROM node:14

# 设置工作目录
WORKDIR /usr/src/app

# 安装 app 依赖
# 复制外层 package.json 和 package-lock.json
COPY package*.json ./
RUN yarn install

# 复制后端 package.json 和 package-lock.json 并进行安装
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN yarn install

# 切回主目录
WORKDIR /usr/src/app

# 复制所有文件到工作目录（这将包括后端和前端的所有文件）
COPY . .

# 运行 build 脚本
RUN yarn build

# 使用环境变量来暴露端口
ARG PORT=8080
ENV PORT=$PORT
EXPOSE $PORT

# 设置启动命令，使用你的启动脚本
CMD ["yarn", "dev"]
