'use client';

import { useMemo, useEffect } from 'react';
import { Loader, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useCurrentMember } from '@/features/members/api/use-current-member';

import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal';

const WorkspaceIdPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });

  // チャンネルが指定されていない場合、チャンネル配列の一番最初のIDが抽出される
  const channelId = useMemo(() => channels?.[0]?._id, [channels]);

  // ユーザーの権限
  const isAdmin = useMemo(() => member?.role === 'admin', [member?.role]);

  useEffect(() => {
    if (
      workspaceLoading ||
      channelsLoading ||
      memberLoading ||
      !workspace ||
      !member
    )
      return;

    if (channelId) {
      // ワークスペースにチャンネルが存在する場合、チャンネルページにリダイレクト
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      // ユーザーがadminかつワークスペースにチャンネルが存在しない場合、チャンネル作成ダイアログの表示
      setOpen(true);
    }
  }, [
    router,
    workspaceId,
    open,
    setOpen,
    workspace,
    workspaceLoading,
    channelId,
    channelsLoading,
    member,
    memberLoading,
    isAdmin,
  ]);

  if (workspaceLoading || channelsLoading || memberLoading) {
    return (
      <div className='h-full flex-1 flex items-center justify-center flex-col gap-2'>
        <Loader className='size-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className='h-full flex-1 flex items-center justify-center flex-col gap-2'>
        <TriangleAlert className='size-6 text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>
          Workspace not found
        </span>
      </div>
    );
  }

  return (
    <div className='h-full flex-1 flex items-center justify-center flex-col gap-2'>
      <TriangleAlert className='size-6 text-muted-foreground' />
      <span className='text-sm text-muted-foreground'>No channel found</span>
    </div>
  );
};

export default WorkspaceIdPage;
