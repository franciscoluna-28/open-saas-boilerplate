"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useActionState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import type { PostItem } from "@/_features/posts/server/queries";
import {
  createPostAction,
  updatePostAction,
  deletePostAction,
  getFeedAction,
  type PostActionResult,
  type CreatePostResult,
  type UpdatePostResult,
  type DeletePostResult,
} from "@/_features/posts/server/actions";
import { PencilIcon, Trash2Icon, LoaderIcon, FeatherIcon } from "lucide-react";

type FeedClientProps = {
  initialPosts: PostItem[];
  initialNextCursor: string | null;
  currentUserId: string;
  currentUserRole: string;
  currentUserName: string;
  currentUserImage: string | null;
};

export function FeedClient({
  initialPosts,
  initialNextCursor,
  currentUserId,
  currentUserRole,
  currentUserName,
  currentUserImage,
}: FeedClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  const [createState, createAction, createPending] = useActionState<PostActionResult | null, FormData>(
    createPostAction,
    null,
  );
  const [deleteState, deleteAction, deletePending] = useActionState<PostActionResult | null, FormData>(
    deletePostAction,
    null,
  );
  const [updateState, updateAction, updatePending] = useActionState<PostActionResult | null, FormData>(
    updatePostAction,
    null,
  );

  const createError = createState && !createState.success ? (createState.error as string) : null;
  const updateError = updateState && !updateState.success ? (updateState.error as string) : null;

  const prevCreateState = useRef(createState);
  useEffect(() => {
    if (createState?.success && prevCreateState.current !== createState) {
      const data = createState.data as CreatePostResult;
      const newPost: PostItem = {
        id: data.id,
        content: data.content,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
        authorId: data.authorId,
        authorName: data.authorName,
        authorImage: data.authorImage,
        canEdit: true,
        canDelete: true,
      };
      setPosts((prev) => [newPost, ...prev]);
      setComposerOpen(false);
    }
    prevCreateState.current = createState;
  }, [createState]);

  const prevUpdateState = useRef(updateState);
  useEffect(() => {
    if (updateState?.success && prevUpdateState.current !== updateState) {
      const data = updateState.data as UpdatePostResult;
      setPosts((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, content: data.content } : p)),
      );
      setEditingId(null);
      setEditContent("");
    }
    prevUpdateState.current = updateState;
  }, [updateState]);

  const prevDeleteState = useRef(deleteState);
  useEffect(() => {
    if (deleteState?.success && prevDeleteState.current !== deleteState) {
      const data = deleteState.data as DeletePostResult;
      setPosts((prev) => prev.filter((p) => p.id !== data.id));
    }
    prevDeleteState.current = deleteState;
  }, [deleteState]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const result = await getFeedAction(nextCursor);
    if (result.success) {
      setPosts((prev) => [...prev, ...result.data.posts]);
      setNextCursor(result.data.nextCursor);
    }
    setLoadingMore(false);
  }, [nextCursor, loadingMore]);

  const startEditing = (post: PostItem) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-2xl!">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-xl font-bold">Feed</h1>
        <Button onClick={() => setComposerOpen(true)} size="sm" className="rounded-full">
          <FeatherIcon className="size-4" />
          <span className="hidden sm:inline">Post</span>
        </Button>
      </div>

      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Post</DialogTitle>
          </DialogHeader>
          <form action={createAction} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={currentUserImage ?? undefined} alt={currentUserName} />
                <AvatarFallback>{initials(currentUserName)}</AvatarFallback>
              </Avatar>
              <Textarea
                name="content"
                placeholder="What's happening?"
                maxLength={500}
                required
                className="min-h-28 resize-none text-base"
                autoFocus
              />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={createPending} className="rounded-full">
                {createPending && <LoaderIcon className="size-4 animate-spin" />}
                {createPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {posts.length === 0 && (
        <div className="px-4 py-4">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No posts yet. Be the first to post!</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 py-4">
        {posts.map((post) => (
          <Card key={post.id} className="group">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={post.authorImage ?? undefined} alt={post.authorName} />
                  <AvatarFallback className="text-xs">{initials(post.authorName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{post.authorName}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {editingId === post.id ? (
                    <form action={updateAction} className="mt-2">
                      <input type="hidden" name="id" value={post.id} />
                      <Textarea
                        name="content"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        maxLength={500}
                        required
                        className="min-h-20 resize-none"
                      />
                      {updateError && <p className="mt-1 text-sm text-destructive">{updateError}</p>}
                      <div className="mt-2 flex gap-2">
                        <Button type="submit" size="xs" disabled={updatePending} className="rounded-full">
                          {updatePending ? <LoaderIcon className="size-3 animate-spin" /> : "Save"}
                        </Button>
                        <Button type="button" variant="ghost" size="xs" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="mt-0.5 text-sm whitespace-pre-wrap break-words">{post.content}</p>
                  )}

                  {editingId !== post.id && post.canEdit && (
                    <div className="mt-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => startEditing(post)}
                        className="h-7 text-muted-foreground hover:text-foreground"
                      >
                        <PencilIcon className="size-3" />
                        Edit
                      </Button>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="xs"
                          disabled={deletePending}
                          className="h-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2Icon className="size-3" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center border-t px-4 py-4">
          <Button variant="ghost" onClick={loadMore} disabled={loadingMore} className="rounded-full text-primary">
            {loadingMore && <Spinner data-icon="inline-start" />}
            {loadingMore ? "Loading..." : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
}
