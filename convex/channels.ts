import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const create = mutation({
  args: {
    name: v.string(),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId)
      )
      .unique();

    if (!member || member.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    // 全ての空白を-に置き換える
    const parsedName = args.name.replace(/\s+/g, '-').toLowerCase();

    const channelId = await ctx.db.insert('channels', {
      name: parsedName,
      workspaceId: args.workspaceId,
    });

    return channelId;
  },
});

export const update = mutation({
  args: {
    id: v.id('channels'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // ユーザー確認
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // チャンネル確認
    const channel = await ctx.db.get(args.id);

    if (!channel) {
      throw new Error('Channel not found');
    }

    const workspaceId = channel.workspaceId;

    // メンバー確認
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', workspaceId).eq('userId', userId)
      )
      .unique();

    if (!member || member.role !== 'admin') {
      throw new Error('Unauthrized');
    }

    await ctx.db.patch(args.id, { name: args.name });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id('channels'),
  },
  handler: async (ctx, args) => {
    // ユーザー確認
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // チャンネル確認
    const channel = await ctx.db.get(args.id);

    if (!channel) {
      throw new Error('Channel not found');
    }

    const workspaceId = channel.workspaceId;

    // メンバー確認
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', workspaceId).eq('userId', userId)
      )
      .unique();

    if (!member || member.role !== 'admin') {
      throw new Error('Unauthrized');
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const getById = query({
  args: { id: v.id('channels') },
  handler: async (ctx, args) => {
    // ユーザーの存在確認
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    // チャンネルの存在確認
    const channel = await ctx.db.get(args.id);

    if (!channel) {
      return null;
    }

    // メンバーの存在確認
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', channel.workspaceId).eq('userId', userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    return channel;
  },
});

export const get = query({
  args: { workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    // ユーザーの存在確認
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    // メンバーの存在確認
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId)
      )
      .unique();

    if (!member) {
      return [];
    }

    const channels = await ctx.db
      .query('channels')
      .withIndex('by_workspace_id', (q) =>
        q.eq('workspaceId', args.workspaceId)
      )
      .collect();

    return channels;
  },
});
