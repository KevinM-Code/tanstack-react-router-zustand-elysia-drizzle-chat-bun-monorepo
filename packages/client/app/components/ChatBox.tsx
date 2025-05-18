
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'

import { HTMLAttributes, forwardRef, useEffect, useRef } from "react";

import { useChatStore } from "../../lib/chatStore";

const messageSchema = z.object({
  message: z.string().min(2, 'Message must be at least 2 characters long'),
})

export const ChatBox = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const form = useForm<z.infer<typeof messageSchema>>({
    defaultValues: { message: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(messageSchema),
  })

  const { messages, sendMessage, connect, disconnect, status } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);



  async function onSubmit({ message }: z.infer<typeof messageSchema>) {
    sendMessage(message);    
    reset();
  }

  useEffect(() => {
    connect();

    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [messages]);

  const statusText =
    status === "CONNECTED" ? "🟢 Connected" : "🔴 Disconnected";

    return (
      <section className='container mx-auto p-5 fixed inset-0'>
      <div className="mockup-window border bg-base-300 w-full h-full flex flex-col">
        <div className='p-5 pb-8 flex-grow overflow-auto'>
          {
            messages.length && messages.map((msg, i) => {
              return (
                <div className={`chat ${msg.role === 'assistant' ? 'chat-start' : 'chat-end'}`} key={'chatKey' + i}>
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img src={msg.role === 'assistant' ? '/images/gptFemale.jpg' : '/images/anakin.webp'} />
                    </div>
                  </div>
                  <div className="chat-bubble">{msg.content}</div>
                </div>
              )
            })
          }
        </div>

        <form className="form-control m-5 items-center" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group max-w-full w-[800px] relative">
            {/* {isTyping && <small className='absolute -top-5 left-0.5 animate-pulse'>Jarvis is Typing...</small>} */}

            <input 
            type="text" 
            placeholder="Type a question for ChatGPT, ask anything!" 
            className="input input-bordered flex-grow" 
            required 
            {...register('message')}
            />
            <button className="btn btn-square" type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
              </svg>
            </button>
          </div>
        </form>
        <div className="text-sm">{statusText}</div>
      </div>
    </section>
    )
  })

//   return (
//     <Card
//       className={cn("flex h-[88vh] max-w-2xl flex-col", className)}
//       {...props}
//       ref={ref}
//     >
//       <CardHeader>
//         <CardTitle>Global</CardTitle>
//       </CardHeader>
//       <ScrollArea className="flex-grow p-6 pt-0">
//         {messages.map((msg, i) => (
//           <div className="my-2" key={i}>
//             <strong>{msg.name}</strong> {msg.message}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </ScrollArea>
//       <CardFooter className="pb-1">
//         <Form {...form}>
//           <form
//             className="flex w-full space-x-2"
//             onSubmit={form.handleSubmit(onSubmit)}
//           >
//             <FormField
//               control={form.control}
//               name="message"
//               render={({ field }) => (
//                 <FormItem className="w-full">
//                   <Input
//                     placeholder="Type a message..."
//                     autoComplete="off"
//                     autoFocus={true}
//                     {...field}
//                   />
//                 </FormItem>
//               )}
//             />
//             <Button type="submit">Send</Button>
//           </form>
//         </Form>
//       </CardFooter>
//       <CardFooter className="justify-end pb-2">
//         <div className="text-sm">{statusText}</div>
//       </CardFooter>
//     </Card>
//   );
// });
// ChatBox.displayName = "ChatBox";
