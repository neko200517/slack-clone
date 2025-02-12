import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from 'lucide-react';

import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useGetMembers } from '@/features/members/api/use-get-members';

import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useChannelId } from '@/hooks/use-channel-id';

import { WorkspaceHeader } from './workspace-header';
import { SidebarItem } from './sidebar-item';
import { UserItem } from './user-item';
import { WorkspaceSection } from './workspace-section';
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal';

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const [_, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels, isLoading: channelLoading } = useGetChannels({
    workspaceId,
  });
  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  if (workspaceLoading || memberLoading || channelLoading || membersLoading) {
    return (
      <div className='flex flex-col bg-[#5E2C5F] h-full items-center justify-center'>
        <Loader className='size-5 animate-spin text-white' />
      </div>
    );
  }

  if (!workspace || !member || !channels || !members) {
    return (
      <div className='flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center'>
        <AlertTriangle className='size-5 text-white' />
        <p className='text-white text-sm'>Workspace not found</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col bg-[#5E2C5F] h-full'>
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={member.role === 'admin'}
      />
      <div className='flex flex-col px-2 mt-3'>
        <SidebarItem label='Threads' icon={MessageSquareText} id='threads' />
        <SidebarItem label='Drafts & Sent' icon={SendHorizonal} id='drafts' />
      </div>
      <WorkspaceSection
        label='Channels'
        hint='New channel'
        onNew={member.role === 'admin' ? () => setOpen(true) : undefined}
      >
        {channels.map((item) => (
          <SidebarItem
            key={item._id}
            label={item.name}
            icon={HashIcon}
            id={item._id}
            variant={channelId === item._id ? 'active' : 'default'}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection
        label='Direct Messages'
        hint='New direct message'
        onNew={() => {}}
      >
        {members.map((item) => (
          <UserItem
            key={item._id}
            id={item._id}
            image={item.user.image}
            label={item.user.name}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};
