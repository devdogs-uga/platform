import { desc } from "drizzle-orm";
import Navigation from "~/components/Navigation";
import { db } from "~/server/db";
import { githubProfiles } from "~/server/db/schema/tables";

export default async function Community() {
  const leaderboard = await db.query.githubProfiles.findMany({
    orderBy: {
      points: "desc"
    },
    with: { user: true },
    limit: 20,
  });

  return (
    <>
      <section className="py-32">hero</section>
      <hr className="mx-auto w-[calc(100vh-4rem)] max-w-4xl rounded-full border-zinc-700" />
      <section className="px-4 py-12">
        <h2 className="text-center text-4xl font-bold">
          Contributions Leaderboard
        </h2>
        <ol className="list-decimal">
          {leaderboard.map((profile) => (
            <li key={profile.login}>{profile.login} &mdash; {profile.points} points</li>
          ))}
        </ol>
      </section>
    </>
  );
}
