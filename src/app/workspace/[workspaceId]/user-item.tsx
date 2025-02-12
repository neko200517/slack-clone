import Link from 'next/link';
import { VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Id } from '../../../../convex/_generated/dataModel';

const userItemVariants = cva(
  'flex item-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden',
  {
    variants: {
      variant: {
        default: 'text-[#f9edffcc]',
        active: 'text-[#481349] bg-white/90 hover:bg-white/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface UserItemProps {
  id: Id<'members'>;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof userItemVariants>['variant'];
}

export const UserItem = ({
  id,
  label = 'Member',
  image,
  variant,
}: UserItemProps) => {
  const workspaceId = useWorkspaceId();
  const avatarFallback = label.charAt(0).toUpperCase();

  return (
    <Button
      variant='tranparent'
      className={cn(userItemVariants({ variant }))}
      size='sm'
    >
      <Link
        href={`/workspace/${workspaceId}/member/${id}`}
        className='flex gap-x-2'
      >
        <Avatar className='size-5 rounded-md mr-1'>
          <AvatarImage src={image} className='rounded-md' />
          <AvatarFallback className='rounded-md bg-sky-500 text-white text-xs'>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className='text-sm truncate'>{label}</span>
      </Link>
    </Button>
  );
};
