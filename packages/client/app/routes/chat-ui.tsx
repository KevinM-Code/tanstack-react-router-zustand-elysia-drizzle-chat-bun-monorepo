import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import { useEffect, useState } from "react";

import { useChatStore } from "../../lib/chatStore";
import { useAuthStore } from '../../lib/authStore';
import { getSessionData } from '../components/navigation';
import { useEden } from '../../lib/useEden';
import { useUserName } from '../../lib/context';

export const Route = createFileRoute('/chat-ui')({
  component: RouteComponent,
});

const messageSchema = z.object({
  message: z.string().min(2, 'Message must be at least 2 characters long'),
});

function RouteComponent() {
  const { sendMessage, connect, disconnect, status, messages } = useChatStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(messageSchema),
  });

  const { api } = useEden();
  const router = useRouter();
  const { dispatch } = useUserName();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const tokenExists = !!useAuthStore.getState().token;

    getSessionData(api, router, tokenExists).then((res) => {
      if (res) {
        dispatch({ type: 'SET_NAME', payload: res.name });

        useAuthStore.setState({
          user: res.name,
          token: res.accessToken,
          id: res.id,
          timestamp: res.timestamp,
        });
      }
      setIsFirstLoad(false);
    });
  }, [api, router]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const onSubmit = (data: { message: string }) => {
    sendMessage(data.message);
    reset();
  };

  const statusText = status === "CONNECTED" ? "🟢 Connected" : "🔴 Disconnected";

  return (
    <div className="flex items-center justify-center m-4">
      <div className="container justify-center max-w-2xl h-5/6">
        <div className="mockup-window border bg-base-300 w-full h-[85vh] flex flex-col">
          <div className="p-5 pb-8 flex-grow overflow-auto">
            {messages.length
              ? messages.map((msg, i) => (
                <div
                  className={`chat ${msg.name !== useAuthStore.getState().user
                    ? 'chat-start'
                    : 'chat-end'
                    }`}
                  key={`chatKey${i}`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={`https://ui-avatars.com/api/?name=${msg.name}&rounded=true&background=random`}
                        alt={msg.name}
                      />
                    </div>
                  </div>
                  <div className="chat-bubble">{msg.message}</div>
                </div>
              ))
              : null}
          </div>

          <form
            className="form-control m-5 items-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="input-group ">
              <input
                type="text"
                placeholder="Type something here"
                className="input input-bordered flex-grow w-[300px]"
                {...register('message')}
              />
              <div className='inline-block align-bottom'>
                <button className="btn btn-square ml-2" type="submit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                  </svg>
                </button>
              </div>
              {errors.message && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.message.message}
                </p>
              )}
            </div>
          </form>
          <div className="text-sm">{statusText}</div>
        </div>
      </div>
    </div>
  );
}
