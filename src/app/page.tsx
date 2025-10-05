import { getSessionUser } from "~/server/auth";
export default async function HomePage() {
  const session = await getSessionUser();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-6">
      <p>Hello world!</p>
    </div>
  );
}
