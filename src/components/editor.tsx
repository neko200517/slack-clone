import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PiTextAa } from 'react-icons/pi';
import { MdSend } from 'react-icons/md';
import { ImageIcon, Smile } from 'lucide-react';

import Quill, { type QuillOptions } from 'quill';
import { Delta, Op } from 'quill/core';

import { cn } from '@/lib/utils';

import { Hint } from './hint';
import { Button } from './ui/button';
import { EmojiPopover } from './emoji-popover';

import 'quill/dist/quill.snow.css';

export type EditorValue = {
  image: File | null;
  body: string;
};

interface EditorProps {
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: RefObject<Quill | null>; // React19: MutableRefObjectの廃止→RefObject一本化
  variant?: 'create' | 'update';
}

const Editor = ({
  onSubmit,
  onCancel,
  placeholder = 'Write something...',
  defaultValue = [],
  disabled = false,
  innerRef,
  variant = 'create',
}: EditorProps) => {
  const [text, setText] = useState('');
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);

  // useLayoutEffect: ブラウザが画面を再描画する前に実行する
  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  // useEffect: ブラウザが画面を描画した後で実行する
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    const options: QuillOptions = {
      theme: 'snow',
      placeholder: placeholderRef.current,

      modules: {
        // ツールバーのカスタマイズ
        toolbar: [
          ['bold', 'italic', 'strike'], // 太字、斜体、打消し線
          ['link'], // リンク
          [{ list: 'ordered' }, { list: 'bullet' }], // 数値リスト、箇条書き
        ],

        // キー操作のカスタマイズ
        keyboard: {
          bindings: {
            // Enter: 無効
            enter: {
              key: 'Enter',
              handler: () => {
                return;
              },
            },
            // Shift+Enter: 改行
            shift_enter: {
              key: 'Enter',
              shiftKey: true,
              handler: () => {
                // 現在のカーソル位置に改行を挿入
                quill.insertText(quill.getSelection()?.index || 0, '\n');
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    // innnerRef = quill の関連付け
    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    // テキスト変更時に発火するイベント
    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    // アンマウント
    return () => {
      // イベントを解除
      quill.off(Quill.events.TEXT_CHANGE);

      if (container) {
        container.innerHTML = '';
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  // ツールバー表示の切り替え
  const toggleToolbar = () => {
    setIsToolbarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector('.ql-toolbar'); // ツールバーの取得

    // ツールバーを表示/非表示
    if (toolbarElement) {
      toolbarElement.classList.toggle('hidden');
    }
  };

  // リッチテキストの空白判定（htmlタグ置換+空白を削除して判定）
  const isEmpty = text.replace(/<(.|\n)*?>/g, '').trim().length === 0;

  // 絵文字の挿入
  const onEmojiSelect = (emoji: any) => {
    const quill = quillRef.current;

    quill?.insertText(quill.getSelection()?.index || 0, emoji.native);
  };

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white'>
        <div ref={containerRef} className='h-full ql-custom' />
        <div className='flex px-2 pb-2 z-[5]'>
          <Hint
            label={isToolbarVisible ? 'Hide formatting' : 'Show formatting'}
          >
            <Button
              disabled={disabled}
              size='iconSm'
              variant='ghost'
              onClick={toggleToolbar}
            >
              <PiTextAa className='size-4' />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} size='iconSm' variant='ghost'>
              <Smile className='size-4' />
            </Button>
          </EmojiPopover>
          {variant === 'create' && (
            <Hint label='Image'>
              <Button
                disabled={disabled}
                size='iconSm'
                variant='ghost'
                onClick={() => {}}
              >
                <ImageIcon className='size-4' />
              </Button>
            </Hint>
          )}
          {variant === 'update' && (
            <div className='ml-auto flex items-center gap-x-2'>
              <Button
                disabled={disabled}
                onClick={() => {}}
                variant='outline'
                size='sm'
              >
                Cancel
              </Button>
              <Button
                disabled={disabled || isEmpty}
                onClick={() => {}}
                size='sm'
                className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
              >
                Save
              </Button>
            </div>
          )}
          {variant === 'create' && (
            <Button
              disabled={disabled || isEmpty}
              onClick={() => {}}
              size='iconSm'
              className={cn(
                'ml-auto',
                isEmpty
                  ? 'bg-white hover:bg-white text-muted-foreground'
                  : 'bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
              )}
            >
              <MdSend className='size-4' />
            </Button>
          )}
        </div>
      </div>
      {variant === 'create' && (
        <div
          className={cn(
            'p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition',
            !isEmpty && 'opacity-100'
          )}
        >
          <p>
            <strong>Shift + Return</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
};

export default Editor;
