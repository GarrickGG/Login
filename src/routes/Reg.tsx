import Container from "../components/Container";
import Input from "../components/Input";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import config from "../config/server";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";


export default function () {
  let [userName, setUserName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [verifyNumber, setVn] = useState("");

  const sendVN = () => {
    if (!email.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
      Swal.fire(
        "请输入正确的邮箱",
        "检测到您输入的邮箱不是正确邮箱格式，请重新输入后再试",
        "error"
      );
      return;
    }
      fetch(`${config.server.baseUrl}account/reg/email/getv?email=${email}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      Swal.fire("Good job!", "发送成功，请检查邮箱", "success");
    })
    .catch(error => {
      Swal.fire("发送失败", "请检查您的网络连接", "error");
      console.log(error);
    });
  }


    const reg = async ([un, ea, pw, vn]: string[]) => {
    let xhr = await fetch(`${config.server.baseUrl}account/reg`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: un,
        password: pw,
        email: ea,
        verificationCode: vn,
      }),
    });

    return await xhr.text();
  };

  useEffect(() => {
    document.title = "Register - EHWorld";
  }, []);

  return (
    <Container>
      <h1>注册</h1>
      <Input
        onChange={(e) => setUserName(e.target.value)}
        value={userName}
        type={"text"}
        placeholder={"用户名"}
      />
      <Input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type={"text"}
        placeholder={"邮箱"}
      />
      <Input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type={"password"}
        placeholder={"密码"}
      />
      <Input
        onChange={(e) => setVn(e.target.value)}
        value={verifyNumber}
        type={"text"}
        placeholder={"验证码"}
      />
      <Button style={{ marginRight: "30px" }} onClick={sendVN}>
        发送验证码
      </Button>
      <Button
        onClick={async () => {
          const result = await reg([userName, email, password, verifyNumber])
          if(result === "用户名或邮箱已存在"){
            Swal.fire(
              "用户名或邮箱已存在",
              "请换一个邮箱",
              "error"
            );
          };
          if(result === "验证码不正确"){
            Swal.fire(
              "验证码不正确",
              "请重新确认验证码",
              "error"
            );
          };
          if(result === "用户创建成功"){
            Swal.fire(
              "用户创建成功",
              "请返回登陆界面",
              "success"
            );
          };
        }}
      >
        注册
      </Button>
    </Container>
  );
}
