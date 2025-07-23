"use client";

import { useState, useRef, useEffect } from "react";
import type { User, ChatChannel, Message, ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Send,
  Users,
  Hash,
  Settings,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";

interface ChatSystemProps {
  currentUser: User;
}

export default function ChatSystem({ currentUser }: ChatSystemProps) {
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch("/api/chat/channels");
        const data = await response.json();
        setChannels(data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    fetchChannels();
  }, []);

  useEffect(() => {
    if (channels.length > 0) {
      setActiveChannel(channels[0].id);
    }
  }, [channels]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChannel) {
        try {
          const response = await fetch(`/api/chat/${activeChannel}`);
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [activeChannel]);

  const sendMessage = async () => {
    if (message.trim() && activeChannel) {
      try {
        const response = await fetch(`/api/chat/${activeChannel}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: message.trim() }),
        });

        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeChannelInfo = channels.find((c) => c.id === activeChannel);

  const canAccessChannel = (channel: ChatChannel) => {
    const roleHierarchy = [
      "Administrator",
      "Senior VP",
      "VP",
      "Officer",
      "Employee",
    ];
    const userRoleIndex = currentUser.role
      ? roleHierarchy.indexOf(currentUser.role.name)
      : -1;
    const requiredRoleIndex = roleHierarchy.indexOf(channel.requiredRole);

    if (userRoleIndex < requiredRoleIndex) return false;
    if (channel.department && channel.department !== currentUser.department)
      return false;

    return true;
  };

  const accessibleChannels = channels && channels.filter(canAccessChannel);

  return (
    <div className="h-[calc(100vh-200px)] flex">
      {/* Channels Sidebar */}
      <div className="w-80 bg-background border-r">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Chat Channels</h3>
          <p className="text-sm text-muted-foreground">
            Role-based communication
          </p>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {accessibleChannels.map((channel) => (
              <Button
                key={channel.id}
                variant={activeChannel === channel.id ? "default" : "ghost"}
                className="w-full justify-start h-auto p-3"
                onClick={() => setActiveChannel(channel.id)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="flex items-center space-x-2">
                    {channel.type === "private" ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <Hash className="h-4 w-4" />
                    )}
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  <div className="ml-auto flex items-center space-x-1">
                    {/*{channel.unread > 0 && (*/}
                    {/*  <Badge*/}
                    {/*    variant="destructive"*/}
                    {/*    className="text-xs h-5 min-w-[20px] rounded-full"*/}
                    {/*  >*/}
                    {/*    {channel.unread}*/}
                    {/*  </Badge>*/}
                    {/*)}*/}
                    <span className="text-xs text-muted-foreground">
                      {channel.members}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {activeChannelInfo?.type === "private" ? (
                <Users className="h-5 w-5" />
              ) : (
                <Hash className="h-5 w-5" />
              )}
              <div>
                <h3 className="font-semibold">{activeChannelInfo?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {activeChannelInfo?.members} members •{" "}
                  {activeChannelInfo?.type} channel
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages &&
              Array.isArray(messages) &&
              messages.map((msg: ChatMessage) => (
                <div key={msg.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={msg.user?.avatar_url || "/api/placeholder/32/32"}
                      alt={msg.user?.name}
                    />
                    <AvatarFallback>{msg.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {msg.user?.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {msg.user?.role?.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className={`text-sm mt-1`}>{msg.message}</p>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={`Message #${activeChannelInfo?.name}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
