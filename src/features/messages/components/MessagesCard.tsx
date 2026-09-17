import type { Message, User } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { MessageForm } from "./MessageForm";

type MessageWithSender = Pick<Message, "id" | "body" | "createdAt" | "senderId"> & {
  sender: Pick<User, "id" | "name">;
};

interface MessagesCardProps {
  bookingId: string;
  currentUserId: string;
  messages: MessageWithSender[];
}

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Comunicação por aluguel (Context.md §8.15) — versão estruturada, não um chat completo: lista em
// ordem cronológica (mais antiga primeiro, mesma ordenação de BookingStatusTimeline) mais um campo
// de envio, sem indicador de digitação, confirmação de leitura ou tempo real — mensagens novas
// aparecem ao recarregar a página, como o resto do acompanhamento do aluguel.
export function MessagesCard({ bookingId, currentUserId, messages }: MessagesCardProps) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-neutral-900">Mensagens</h2>

      {messages.length === 0 ? (
        <p className="mt-1 text-sm text-neutral-500">
          Combine detalhes da retirada, entrega ou tire dúvidas sobre este aluguel por aqui.
        </p>
      ) : (
        <ol className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto">
          {messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <li key={message.id} className={cn("flex flex-col gap-0.5", isOwn ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                    isOwn ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-900",
                  )}
                >
                  {message.body}
                </div>
                <span className="text-xs text-neutral-400">
                  {isOwn ? "Você" : message.sender.name} · {formatDateTime(message.createdAt)}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <MessageForm className="mt-4" bookingId={bookingId} />
    </Card>
  );
}
