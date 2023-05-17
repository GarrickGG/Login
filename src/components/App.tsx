import React from "react";
import { useEffect, useReducer, useState } from "react";
import config from "../config/server";
import Button from "./Button";
import Input from "./Input";
import Container from "./Container";
import { Link } from "react-router-dom";
import jwtDecode from 'jwt-decode';



import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

export type UserDataField = "email" | "password";
export interface FormField {
  name: string;
  objName: UserDataField;
  type: "text" | "password";
}

const App: React.FC = () => {
  const [userData, setUserData] = useState({} as Record<UserDataField, string>);
  const [disabled, setDisabled] = useReducer(
    (disabled: boolean) => !disabled,
    false
  );
  const fields: FormField[] = [
    {
      name: "Email",
      objName: "email",
      type: "text",
    },
    {
      name: "Password",
      objName: "password",
      type: "password",
    },
  ];

  useEffect(() => {
    document.title = "Login - EHWorld";
  }, []);

  const storeTryCount = () => {
    window.localStorage.tryCount == undefined
      ? window.localStorage.setItem("tryCount", "0")
      : undefined;
    window.localStorage.setItem(
      "tryCount",
      String(Number(window.localStorage.tryCount) + 1)
    );
    window.localStorage.setItem("time", Date.now().toString());
  };

  const getTryCount = () =>
    Number(window.localStorage.getItem("tryCount")) ?? 0;

  const handleFormInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: FormField
  ) => {
    const userDataCopy = userData;
    userDataCopy[field.objName] = e.target.value;
    setUserData(userDataCopy);
  };

  const login = () => {
    if (!userData.email) {
      Swal.fire("请填入邮箱", "检测到您尚未输入邮箱，请输入后再试", "error");
      return;
    }
    if (!userData.password) {
      Swal.fire("请填入密码", "检测到您尚未输入密码，请输入后再试", "error");
      return;
    }
    if (
      !userData.email.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    ) {
      Swal.fire(
        "请输入正确的邮箱",
        "检测到您输入的邮箱不是正确邮箱格式，请重新输入后再试",
        "error"
      );
      return;
    }
    if (
      getTryCount() >= 100 &&
      Date.now() - Number(window.localStorage.getItem("time")) <= 900000
    ) {
      Swal.fire(
        "不要继续尝试了！",
        "您已尝试超过五次，请不要继续尝试",
        "error"
      );
      return;
    }
    setDisabled();
    let xhr = new XMLHttpRequest();
  xhr.open("POST", `${config.server.baseUrl}account/log`, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onload = function() {
    if (this.status === 400) {
      Swal.fire("Error!", this.responseText, "error");
    } else if (this.status === 200) {
      const response = JSON.parse(this.responseText);
      // decode the jwt token to get user info
      //const user = jwtDecode(response.token);
      // store user info to sessionStorage
      //sessionStorage.setItem('user', JSON.stringify(user));
      // navigate to main application
      window.location.href = `http://guoyichat.tech/?token=${response.token}`;
    }
  };

  xhr.send(JSON.stringify({ email: userData.email, password: userData.password }));

    setDisabled();
    storeTryCount();

  };

  return (
    <Container>
      <h1>Chatbot</h1>
      {fields.map((field, index) => (
        <Input
          onChange={(e) => handleFormInput(e, field)}
          value={userData[field.objName as UserDataField]}
          type={field.type}
          placeholder={field.name}
          key={index}
        />
      ))}
      <Button disabled={disabled} onClick={login}>
        登录
      </Button>
      <hr style={{margin: "1.2rem"}} />
      <p style={{fontSize: "15px"}}>没有账号？<Link to={"/reg"}>注册一个！</Link></p>
    </Container>
  );
};

export default App;
