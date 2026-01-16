import signIn from "~/server/actions/signIn";
import signOut from "~/server/actions/signOut";
import { getSessionUser } from "~/server/auth";

export default async function HomePage() {
  return <p>Hello world!</p>;
}
