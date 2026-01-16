import { PiDiscordLogoFill, PiSignOut } from "react-icons/pi";
import signIn from "~/server/actions/signIn";
import signOut from "~/server/actions/signOut";
import { getSessionUser } from "~/server/auth";

export default async function HomePage() {
  const session = await getSessionUser({
    with: { discord: true, github: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-6 py-6">
      {session ? (
        <>
          <p>Hi, {session.user.name}!</p>

          <form action={signOut} className="contents">
            <button
              className="flex items-center gap-2.5 rounded-sm border border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 px-5 py-0.5 shadow-xs transition-shadow hover:shadow-sm active:bg-gradient-to-t active:shadow-inner"
              type="submit"
            >
              Sign Out <PiSignOut />
            </button>
          </form>

          {session.user.discord ? (
            <p>
              Linked to <code>@{session.user.discord.username}</code> on
              Discord!
            </p>
          ) : (
            <form action={signIn} className="contents">
              <button
                className="flex items-center gap-2.5 rounded-sm border border-indigo-900 bg-gradient-to-b from-indigo-500 to-indigo-600 px-5 py-0.5 text-white shadow-xs transition-shadow hover:shadow-md active:bg-gradient-to-t active:shadow-inner"
                type="submit"
                name="realm"
                value="discord"
              >
                <PiDiscordLogoFill />
                Link Discord Account
              </button>
            </form>
          )}
        </>
      ) : (
        <>
          <form action={signIn} className="contents">
            <button type="submit">Sign In with Google</button>
          </form>
          <form action={signIn} className="contents">
            <button name="realm" value="discord" type="submit">
              Sign In with Discord
            </button>
          </form>
          <form action={signIn} className="contents">
            <button name="realm" value="github" type="submit">
              Sign In with Github
            </button>
          </form>
        </>
      )}
    </div>
  );
}
