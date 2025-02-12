import { toast } from 'sonner';
import { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useUpdateWorkspace } from '@/features/workspaces/api/use-update-workspace';
import { useRemoveWorkspace } from '@/features/workspaces/api/use-remove-workspace';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PreferencesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}

export const PreferencesModal = ({
  open,
  setOpen,
  initialValue,
}: PreferencesModalProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const [ConfirmDialog, confirm] = useConfirm({
    title: 'Are you sure?',
    message: 'This action is irrevesible.',
  });

  const { mutate: updateWorkspace, isPending: isUpdateWorkspacePending } =
    useUpdateWorkspace();
  const { mutate: removeWorkspace, isPending: isRemoveWorkspacePending } =
    useRemoveWorkspace();

  const [value, setValue] = useState(initialValue);
  const [editOpen, setEditOpen] = useState(false);

  const handleRemove = async () => {
    const ok = await confirm();

    if (!ok) return;

    await removeWorkspace(
      { id: workspaceId },
      {
        onSuccess: () => {
          toast.success('Workspace removed');
          router.replace(`/`);
        },
        onError: () => {
          toast.error('Failed to remove workspace');
        },
      }
    );
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await updateWorkspace(
      { id: workspaceId, name: value },
      {
        onSuccess: () => {
          toast.success('Workspace updated');
          setEditOpen(false);
        },
        onError: () => {
          toast.error('Failed to update workspace');
        },
      }
    );
  };

  return (
    <>
      <ConfirmDialog />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className='p-0 bg-gray-50 overflow-hidden'
          aria-describedby=''
        >
          <DialogHeader className='p-4 border-b bg-white'>
            <DialogTitle>{value}</DialogTitle>
          </DialogHeader>

          <div className='px-4 pb-4 flex flex-col gap-y-2'>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className='px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-semibold'>Workspace name</p>
                    <p className='text-sm text-[#1264a3] hover:underline font-semibold'>
                      Edit
                    </p>
                  </div>
                  <p className='text-sm'>{value}</p>
                </div>
              </DialogTrigger>

              <DialogContent aria-describedby=''>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                </DialogHeader>
                <form className='space-y-4' onSubmit={handleEdit}>
                  <Input
                    disabled={isUpdateWorkspacePending}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
                  />
                  <DialogFooter className='flex flex-row gap-x-2 justify-end'>
                    <DialogClose asChild>
                      <Button
                        variant='outline'
                        disabled={isUpdateWorkspacePending}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdateWorkspacePending}>Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <button
              disabled={isRemoveWorkspacePending}
              onClick={handleRemove}
              className='flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600'
            >
              <TrashIcon className='size-4' />
              <p className='text-sm font-semibold'>Delete workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
