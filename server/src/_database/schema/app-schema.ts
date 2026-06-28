import {
  text,
  boolean,
  pgTable,
  timestamp,
  index,
  jsonb,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const post = pgTable(
  "post",
  {
    id: id(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    tasksMetadata: jsonb("tasks_metadata").default({}).notNull(),
    ...timestamps,
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("post_author_idx").on(table.authorId)],
);

export const task = pgTable(
  "task",
  {
    id: id(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    completed: boolean("completed").default(false).notNull(),
    markedAsDoneAt: timestamp("marked_as_done_at", { withTimezone: true }),
    ...timestamps,
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
  },
  (table) => [index("tasks_post_idx").on(table.postId)],
);

export const like = pgTable(
  "post_like",
  {
    id: id(),
    ...timestamps,
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("like_post_idx").on(table.postId),
    index("like_user_idx").on(table.userId),
    unique("like_unique").on(table.userId, table.postId),
  ],
);

export const comment = pgTable(
  "comment",
  {
    id: id(),
    content: text("content").notNull(),
    ...timestamps,
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    parentCommentId: text("parent_comment_id"),
  },
  (table) => [
    index("comment_post_idx").on(table.postId),
    index("comment_author_idx").on(table.authorId),
    index("comment_parent_idx").on(table.parentCommentId),
    index("comment_created_idx").on(table.createdAt),
    foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
  ],
);

export const todo = pgTable(
  "todo",
  {
    id: id(),
    title: text("title").notNull(),
    completed: boolean("completed").default(false).notNull(),
    ...timestamps,
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("todo_user_idx").on(table.userId)],
);

export const notification = pgTable(
  "notification",
  {
    id: id(),
    type: text("type").notNull(),
    read: boolean("read").default(false).notNull(),
    ...timestamps,
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    postId: text("post_id").references(() => post.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    index("notification_user_idx").on(table.userId),
    index("notification_read_idx").on(table.userId, table.read),
    index("notification_created_idx").on(table.createdAt),
  ],
);

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, { fields: [post.authorId], references: [user.id] }),
  tasks: many(task),
  likes: many(like),
  comments: many(comment),
}));

export const taskRelations = relations(task, ({ one }) => ({
  post: one(post, { fields: [task.postId], references: [post.id] }),
}));

export const likeRelations = relations(like, ({ one }) => ({
  user: one(user, { fields: [like.userId], references: [user.id] }),
  post: one(post, { fields: [like.postId], references: [post.id] }),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
  author: one(user, { fields: [comment.authorId], references: [user.id] }),
  post: one(post, { fields: [comment.postId], references: [post.id] }),
  parent: one(comment, {
    fields: [comment.parentCommentId],
    references: [comment.id],
  }),
  replies: many(comment),
}));

export const todoRelations = relations(todo, ({ one }) => ({
  user: one(user, { fields: [todo.userId], references: [user.id] }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, { fields: [notification.userId], references: [user.id] }),
  actor: one(user, { fields: [notification.actorId], references: [user.id] }),
  post: one(post, { fields: [notification.postId], references: [post.id] }),
}));
