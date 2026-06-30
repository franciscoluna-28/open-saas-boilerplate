import { getSession } from "@/_features/auth/server/actions";
import { redirect } from "next/navigation";
import { getFeed } from "@/_features/posts/server/queries";
import { FeedClient } from "./feed-client";

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.banned) redirect("/app/profile");

  const { posts, nextCursor } = await getFeed(session.user.id, session.user.role);

  return (
    <FeedClient
      initialPosts={posts}
      initialNextCursor={nextCursor}
      currentUserId={session.user.id}
      currentUserRole={session.user.role}
      currentUserName={session.user.name}
      currentUserImage={session.user.image ?? null}
    />
  );
}
