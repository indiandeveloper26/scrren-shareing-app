import { cookies } from "next/headers";
import Login from "./component/login/page";
import { redirect } from "next/navigation";

export default function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  console.log("Token mil gaya:", token);

  // ✔ If token exists → user already logged in → redirect
  if (token) {
    redirect("/screenshare");
  }

  // ✔ Otherwise show login page
  return <Login />;
}
