import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchChatHistory, sendChatMessage, clearChatHistory } from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AIChatbot() {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: history, isLoading } = useQuery<Message[]>({
    queryKey: ['chat-history'],
    queryFn: fetchChatHistory
  });

  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ['chat-history'] });
      const previousHistory = queryClient.getQueryData(['chat-history']);
      queryClient.setQueryData(['chat-history'], (old: any) => [
        ...(old || []),
        { role: 'user', content: newMessage, timestamp: new Date().toISOString() }
      ]);
      return { previousHistory };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
    onError: (err, newMessage, context: any) => {
      queryClient.setQueryData(['chat-history'], context.previousHistory);
      toast.error("Failed to send message");
    }
  });

  const clearMutation = useMutation({
    mutationFn: clearChatHistory,
    onSuccess: () => {
      queryClient.setQueryData(['chat-history'], []);
      toast.success("Chat history cleared");
    },
    onError: () => {
      toast.error("Failed to clear history");
    }
  });

  useEffect(() => {
// ...
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || mutation.isPending) return;
    mutation.mutate(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto backdrop-blur-xl bg-card/30 rounded-3xl border border-muted-foreground/10 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-muted-foreground/10 flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">FinCoach AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${mutation.isError ? 'bg-destructive' : 'bg-success'}`} />
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {mutation.isError ? 'Trouble Connecting' : 'Operational'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <Button 
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending || !history?.length}
            variant="ghost" 
            size="icon" 
            className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
           >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
        ) : (
          <AnimatePresence>
            {history?.map((msg, i) => (
              <motion.div
                key={msg._id || i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center border shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary/10 border-primary/20 text-primary' 
                      : 'bg-card border-muted-foreground/10 text-muted-foreground'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-card-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                      : 'bg-card border border-muted-foreground/10 text-foreground rounded-tl-none prose prose-sm dark:prose-invert max-w-none'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown 
                        components={{
                          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold" />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {mutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 items-center">
                  <div className="h-8 w-8 rounded-xl bg-card border border-muted-foreground/10 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="px-4 py-2 bg-card border border-muted-foreground/10 rounded-2xl rounded-tl-none italic text-muted-foreground text-xs">
                    Analysing your finances...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-card/50 border-t border-muted-foreground/10">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <Input
            placeholder="Ask anything about your savings, expenses or goals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={mutation.isPending}
            className="rounded-2xl h-12 pl-4 pr-12 border-muted-foreground/20 focus:ring-2 focus:ring-primary/20 transition-all bg-background/50"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || mutation.isPending}
            className="absolute right-1 top-1 h-10 w-10 rounded-xl gradient-primary border-0 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter font-bold opacity-50">
          Powered by Groq AI • Your data is processed securely
        </p>
      </div>
    </div>
  );
}
