"use client";
import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCheck,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  createConversation,
  getConversations,
  getCurrentUser,
  getMessages,
  markConversationAsRead,
  searchUsers,
  sendMessage,
  type ConversationItem,
  type MessageItem,
  type UserProfile,
} from "@/lib/api";
import { connectSocket } from "@/lib/socket";
function getInitials(
  displayName?: string,
  username?: string,
) {
  const source =
    displayName?.trim() || username?.trim() || "?";
  const words = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return (
    words
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "?"
  );
}
function formatConversationTime(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const difference =
    now.getTime() - date.getTime();
  const sevenDays =
    7 * 24 * 60 * 60 * 1000;
  if (difference >= 0 && difference < sevenDays) {
    return date.toLocaleDateString([], {
      weekday: "short",
    });
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}
function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatDayLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDate = (
    first: Date,
    second: Date,
  ) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
  if (sameDate(date, today)) {
    return "Today";
  }
  if (sameDate(date, yesterday)) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== today.getFullYear()
        ? "numeric"
        : undefined,
  });
}
function mergeMessages(
  current: MessageItem[],
  incoming: MessageItem[],
): MessageItem[] {
  const messageMap = new Map<string, MessageItem>();
  for (const message of current) {
    messageMap.set(message.id, message);
  }
  for (const message of incoming) {
    messageMap.set(message.id, message);
  }
  return Array.from(messageMap.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime(),
  );
}
export default function MessagesPage() {
  const [
    conversations,
    setConversations,
  ] = useState<ConversationItem[]>([]);
  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<ConversationItem | null>(null);
  const [messages, setMessages] =
    useState<MessageItem[]>([]);
  const [currentUser, setCurrentUser] =
    useState<UserProfile | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [
    messagesLoading,
    setMessagesLoading,
  ] = useState(false);
  const [sending, setSending] =
    useState(false);
  const [error, setError] =
    useState("");
  const [
    messagesError,
    setMessagesError,
  ] = useState("");
  const [
    newMessageOpen,
    setNewMessageOpen,
  ] = useState(false);
  const [
    userSearchQuery,
    setUserSearchQuery,
  ] = useState("");
  const [
    userSearchResults,
    setUserSearchResults,
  ] = useState<UserProfile[]>([]);
  const [
    userSearchLoading,
    setUserSearchLoading,
  ] = useState(false);
  const [
    userSearchError,
    setUserSearchError,
  ] = useState("");
  const [
    startingConversation,
    setStartingConversation,
  ] = useState<string | null>(null);
  const threadEndRef =
    useRef<HTMLDivElement | null>(null);
  const selectedConversationIdRef = useRef<string | null>(null);
  selectedConversationIdRef.current = selectedConversation?.id ?? null;
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
  const loadedConversationIdRef = useRef<string | null>(null);
  const selectedParticipant =
    selectedConversation?.participant ?? null;
  const visibleMessages = useMemo(
    () => messages,
    [messages],
  );
  async function loadPage() {
    try {
      setLoading(true);
      setError("");
      const [user, conversationList] =
        await Promise.all([
          getCurrentUser(),
          getConversations(),
        ]);
      setCurrentUser(user);
      setConversations(conversationList);
      setSelectedConversation(
        (currentConversation) => {
          if (currentConversation) {
            const refreshed =
              conversationList.find(
                (conversation) =>
                  conversation.id ===
                  currentConversation.id,
              );
            if (refreshed) {
              return refreshed;
            }
          }
          return conversationList[0] ?? null;
        },
      );
    } catch (err) {
      console.error(
        "Messages page error:",
        err,
      );
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load messages.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void loadPage();
  }, []);
  useEffect(() => {
    if (!currentUser?.id) return;
    const token = window.localStorage.getItem("aio_token");
    if (!token) return;
    const socket = connectSocket(token);
    socketRef.current = socket;
    let active = true;
    const refreshConversations = async () => {
      try {
        const latest = await getConversations();
        if (!active) return;
        setConversations(latest);
      } catch (err) {
        console.error("Conversation synchronization failed:", err);
      }
    };
    const handleNewMessage = (message: MessageItem) => {
      if (!active || !message?.id || !message.conversationId) return;
      if (selectedConversationIdRef.current === message.conversationId) {
        setMessages((current) => mergeMessages(current, [message]));
        if (message.senderId !== currentUser.id) {
          void markConversationAsRead(message.conversationId).catch(console.error);
        }
      }
      setConversations((current) => {
        if (!current.some((item) => item.id === message.conversationId)) {
          void refreshConversations();
          return current;
        }
        return current.map((item) => item.id === message.conversationId
          ? { ...item, lastMessageId: message.id,
              lastMessageText: message.content || (message.imageUrl ? "Sent an image" : ""),
              lastMessageSenderId: message.senderId,
              lastMessageAt: message.createdAt, updatedAt: message.updatedAt }
          : item).sort((a, b) => new Date(b.lastMessageAt ?? b.updatedAt).getTime() - new Date(a.lastMessageAt ?? a.updatedAt).getTime());
      });
    };
    const handleConnect = () => {
      void refreshConversations();
      const conversationId = selectedConversationIdRef.current;
      if (conversationId) {
        socket.emit("conversation:join", conversationId);
        void getMessages(conversationId).then((incoming) => {
          if (active && selectedConversationIdRef.current === conversationId &&
              loadedConversationIdRef.current === conversationId) {
            setMessages((current) => mergeMessages(current, incoming));
          }
        }).catch(console.error);
      }
    };
    socket.on("message:new", handleNewMessage);
    socket.on("connect", handleConnect);
    if (socket.connected) handleConnect();
    return () => {
      active = false;
      socket.off("message:new", handleNewMessage);
      socket.off("connect", handleConnect);
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [currentUser?.id]);
  useEffect(() => {
    const conversationId = selectedConversation?.id;
    const socket = socketRef.current;
    if (!conversationId || !socket) return;
    socket.emit("conversation:join", conversationId);
    return () => {
      socket.emit("conversation:leave", conversationId);
    };
  }, [selectedConversation?.id, currentUser?.id]);
  useEffect(() => {
    if (!selectedConversation) {
      loadedConversationIdRef.current = null;
      setMessages([]);
      return;
    }
    loadedConversationIdRef.current = selectedConversation.id;
    setMessages([]);
    let cancelled = false;
    async function loadConversation() {
      try {
        setMessagesLoading(true);
        setMessagesError("");
        const result = await getMessages(
          selectedConversation!.id,
        );
        if (cancelled) {
          return;
        }
        setMessages((current) => mergeMessages(current, result));
        await markConversationAsRead(
          selectedConversation!.id,
        );
        if (cancelled) {
          return;
        }
        setMessages((currentMessages) =>
          currentMessages.map((message) => {
            if (
              !currentUser ||
              message.senderId ===
                currentUser.id ||
              message.readBy.includes(
                currentUser.id,
              )
            ) {
              return message;
            }
            return {
              ...message,
              readBy: [
                ...message.readBy,
                currentUser.id,
              ],
            };
          }),
        );
      } catch (err) {
        console.error(
          "Conversation error:",
          err,
        );
        if (!cancelled) {
          setMessagesError(
            err instanceof Error
              ? err.message
              : "Failed to load conversation.",
          );
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      }
    }
    void loadConversation();
    return () => {
      cancelled = true;
    };
  }, [
    selectedConversation?.id,
    currentUser?.id,
  ]);
  useEffect(() => {
    if (!newMessageOpen) {
      setUserSearchResults([]);
      setUserSearchError("");
      setUserSearchLoading(false);
      return;
    }
    const query =
      userSearchQuery.trim();
    if (!query) {
      setUserSearchResults([]);
      setUserSearchError("");
      setUserSearchLoading(false);
      return;
    }
    let cancelled = false;
    const timeoutId = window.setTimeout(
      async () => {
        try {
          setUserSearchLoading(true);
          setUserSearchError("");
          const results =
            await searchUsers(query);
          if (cancelled) {
            return;
          }
          setUserSearchResults(
            results.filter(
              (user) =>
                user.id !== currentUser?.id,
            ),
          );
        } catch (err) {
          console.error(
            "User search error:",
            err,
          );
          if (!cancelled) {
            setUserSearchResults([]);
            setUserSearchError(
              err instanceof Error
                ? err.message
                : "Failed to search users.",
            );
          }
        } finally {
          if (!cancelled) {
            setUserSearchLoading(false);
          }
        }
      },
      300,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    newMessageOpen,
    userSearchQuery,
    currentUser?.id,
  ]);
  useEffect(() => {
    if (
      messagesLoading ||
      visibleMessages.length === 0
    ) {
      return;
    }
    threadEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    visibleMessages.length,
    messagesLoading,
    selectedConversation?.id,
  ]);
  function closeNewMessage() {
    setNewMessageOpen(false);
    setUserSearchQuery("");
    setUserSearchResults([]);
    setUserSearchError("");
  }
  function handleSelectConversation(
    conversation: ConversationItem,
  ) {
    setSelectedConversation(conversation);
    setMessagesError("");
    closeNewMessage();
  }
  async function handleStartConversation(
    user: UserProfile,
  ) {
    const participantId = user.id;
    if (
      !participantId ||
      startingConversation
    ) {
      return;
    }
    try {
      setStartingConversation(
        participantId,
      );
      setUserSearchError("");
      const conversation =
        await createConversation(
          participantId,
        );
      setConversations(
        (currentConversations) => {
          const existingIndex =
            currentConversations.findIndex(
              (item) =>
                item.id ===
                conversation.id,
            );
          if (existingIndex !== -1) {
            const updated = [
              ...currentConversations,
            ];
            updated[existingIndex] =
              conversation;
            const [selectedItem] =
              updated.splice(
                existingIndex,
                1,
              );
            if (!selectedItem) {
              return updated;
            }
            return [
              selectedItem,
              ...updated,
            ];
          }
          return [
            conversation,
            ...currentConversations,
          ];
        },
      );
      setSelectedConversation(
        conversation,
      );
      closeNewMessage();
    } catch (err) {
      console.error(
        "Start conversation error:",
        err,
      );
      setUserSearchError(
        err instanceof Error
          ? err.message
          : "Failed to start conversation.",
      );
    } finally {
      setStartingConversation(null);
    }
  }
  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (
      !selectedConversation ||
      sending
    ) {
      return;
    }
    const content = draft.trim();
    if (!content) {
      return;
    }
    try {
      setSending(true);
      setMessagesError("");
      const message = await sendMessage(
        selectedConversation.id,
        content,
      );
      if (selectedConversationIdRef.current === selectedConversation.id) {
        setMessages((currentMessages) => mergeMessages(currentMessages, [message]));
      }
      setDraft("");
      const messageTime =
        message.createdAt;
      setConversations(
        (currentConversations) => {
          const updated =
            currentConversations.map(
              (conversation) =>
                conversation.id ===
                selectedConversation.id
                  ? {
                      ...conversation,
                      lastMessageId:
                        message.id,
                      lastMessageText:
                        message.content,
                      lastMessageSenderId:
                        message.senderId,
                      lastMessageAt:
                        messageTime,
                      updatedAt:
                        message.updatedAt,
                    }
                  : conversation,
            );
          return updated.sort(
            (first, second) => {
              const firstTime = new Date(
                first.lastMessageAt ??
                  first.updatedAt,
              ).getTime();
              const secondTime = new Date(
                second.lastMessageAt ??
                  second.updatedAt,
              ).getTime();
              return secondTime - firstTime;
            },
          );
        },
      );
      setSelectedConversation(
        (currentConversation) =>
          currentConversation?.id === selectedConversation.id
            ? {
                ...currentConversation,
                lastMessageId:
                  message.id,
                lastMessageText:
                  message.content,
                lastMessageSenderId:
                  message.senderId,
                lastMessageAt:
                  messageTime,
                updatedAt:
                  message.updatedAt,
              }
            : currentConversation,
      );
    } catch (err) {
      console.error(
        "Send message error:",
        err,
      );
      setMessagesError(
        err instanceof Error
          ? err.message
          : "Failed to send message.",
      );
    } finally {
      setSending(false);
    }
  }
  if (loading) {
    return (
      <main className="aio-messages-page">
        <div className="aio-messages-page-state">
          <div className="aio-messages-state-icon">
            <Loader2
              size={25}
              className="aio-messages-spinner"
            />
          </div>
          <strong>
            Loading your conversations
          </strong>
          <span>
            Getting your AIO messages ready.
          </span>
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="aio-messages-page">
        <div className="aio-messages-page-state">
          <div className="aio-messages-state-icon">
            <Mail size={25} />
          </div>
          <strong>
            Unable to load messages
          </strong>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadPage()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }
  return (
    <main className="aio-messages-page">
      <section className="aio-messages-hero">
        <div className="aio-messages-hero-copy">
          <div className="aio-messages-eyebrow">
            <Sparkles size={14} />
            AIO Conversations
          </div>
          <h1>Messages</h1>
          <p>
            Stay close to the people you
            connect with across AIO.
          </p>
        </div>
        <button
          type="button"
          className="aio-messages-new-button"
          onClick={() => {
            setNewMessageOpen(
              (current) => !current,
            );
            setUserSearchError("");
          }}
        >
          {newMessageOpen ? (
            <X size={18} />
          ) : (
            <Plus size={18} />
          )}
          <span>
            {newMessageOpen
              ? "Close"
              : "New message"}
          </span>
        </button>
      </section>
      {newMessageOpen && (
        <section className="aio-messages-new-panel">
          <div className="aio-messages-new-heading">
            <div className="aio-messages-new-icon">
              <MessageCircle size={19} />
            </div>
            <div>
              <strong>
                Start a conversation
              </strong>
              <span>
                Search for someone on AIO
                and send them a message.
              </span>
            </div>
            <button
              type="button"
              className="aio-messages-close-button"
              aria-label="Close new message"
              onClick={closeNewMessage}
            >
              <X size={17} />
            </button>
          </div>
          <div className="aio-messages-user-search">
            <Search
              size={18}
              aria-hidden="true"
            />
            <input
              type="search"
              value={userSearchQuery}
              onChange={(event) =>
                setUserSearchQuery(
                  event.target.value,
                )
              }
              placeholder="Search by name or username..."
              autoFocus
              aria-label="Search AIO users"
            />
            {userSearchLoading && (
              <Loader2
                size={18}
                className="aio-messages-spinner"
              />
            )}
          </div>
          {userSearchError && (
            <div className="aio-messages-search-error">
              {userSearchError}
            </div>
          )}
          {!userSearchQuery.trim() && (
            <div className="aio-messages-search-hint">
              Search for a person to start
              a private conversation.
            </div>
          )}
          {userSearchQuery.trim() &&
            !userSearchLoading &&
            !userSearchError &&
            userSearchResults.length ===
              0 && (
              <div className="aio-messages-search-empty">
                <Search size={20} />
                <span>
                  No matching users found.
                </span>
              </div>
            )}
          {userSearchResults.length >
            0 && (
            <div className="aio-messages-user-results">
              {userSearchResults.map(
                (user) => {
                  const isStarting =
                    startingConversation ===
                    user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      className="aio-messages-user-result"
                      disabled={Boolean(
                        startingConversation,
                      )}
                      onClick={() =>
                        void handleStartConversation(
                          user,
                        )
                      }
                    >
                      <div className="aio-messages-avatar">
                        {user.avatarUrl ? (
                          <img
                            src={
                              user.avatarUrl
                            }
                            alt={
                              user.displayName
                            }
                          />
                        ) : (
                          <span>
                            {getInitials(
                              user.displayName,
                              user.username,
                            )}
                          </span>
                        )}
                      </div>
                      <div className="aio-messages-user-result-copy">
                        <strong>
                          {user.displayName}
                        </strong>
                        <span>
                          @{user.username}
                        </span>
                      </div>
                      <div className="aio-messages-user-result-action">
                        {isStarting ? (
                          <Loader2
                            size={18}
                            className="aio-messages-spinner"
                          />
                        ) : (
                          <>
                            Message
                            <ArrowUpRight
                              size={15}
                            />
                          </>
                        )}
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
        </section>
      )}
      <section
        className={`aio-messages-workspace${
          selectedConversation
            ? " has-conversation"
            : ""
        }`}
      >
        <aside className="aio-messages-inbox">
          <div className="aio-messages-inbox-header">
            <div>
              <span className="aio-messages-inbox-label">
                Inbox
              </span>
              <strong>
                Conversations
              </strong>
            </div>
            <span className="aio-messages-count">
              {conversations.length}
            </span>
          </div>
          {conversations.length === 0 ? (
            <div className="aio-messages-empty-inbox">
              <div className="aio-messages-empty-icon">
                <Mail size={23} />
              </div>
              <strong>
                No conversations yet
              </strong>
              <span>
                Start chatting with someone
                on AIO.
              </span>
              <button
                type="button"
                onClick={() =>
                  setNewMessageOpen(true)
                }
              >
                <Plus size={16} />
                Start conversation
              </button>
            </div>
          ) : (
            <div className="aio-messages-conversation-list">
              {conversations.map(
                (conversation) => {
                  const participant =
                    conversation.participant;
                  const active =
                    selectedConversation?.id ===
                    conversation.id;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={`aio-messages-conversation${
                        active
                          ? " is-active"
                          : ""
                      }`}
                      onClick={() =>
                        handleSelectConversation(
                          conversation,
                        )
                      }
                    >
                      <div className="aio-messages-avatar aio-messages-conversation-avatar">
                        {participant?.avatarUrl ? (
                          <img
                            src={
                              participant.avatarUrl
                            }
                            alt={
                              participant.displayName
                            }
                          />
                        ) : (
                          <span>
                            {getInitials(
                              participant?.displayName,
                              participant?.username,
                            )}
                          </span>
                        )}
                      </div>
                      <div className="aio-messages-conversation-copy">
                        <div className="aio-messages-conversation-top">
                          <strong>
                            {participant?.displayName ??
                              "AIO User"}
                          </strong>
                          <time>
                            {formatConversationTime(
                              conversation.lastMessageAt ??
                                conversation.updatedAt,
                            )}
                          </time>
                        </div>
                        <div className="aio-messages-conversation-bottom">
                          <span>
                            {conversation.lastMessageText ??
                              "Start a conversation"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
        </aside>
        <section className="aio-messages-chat">
          {!selectedConversation ? (
            <div className="aio-messages-chat-empty">
              <div className="aio-messages-empty-orbit">
                <MessageCircle size={31} />
              </div>
              <span className="aio-messages-empty-kicker">
                Your inbox
              </span>
              <h2>
                Start a meaningful conversation
              </h2>
              <p>
                Select a conversation from your
                inbox or find someone new on AIO.
              </p>
              <button
                type="button"
                onClick={() =>
                  setNewMessageOpen(true)
                }
              >
                <Plus size={17} />
                New message
              </button>
            </div>
          ) : (
            <>
              <header className="aio-messages-chat-header">
                <button
                  type="button"
                  className="aio-messages-mobile-back"
                  aria-label="Back to conversations"
                  onClick={() =>
                    setSelectedConversation(
                      null,
                    )
                  }
                >
                  <ArrowLeft size={19} />
                </button>
                <div className="aio-messages-avatar aio-messages-chat-avatar">
                  {selectedParticipant?.avatarUrl ? (
                    <img
                      src={
                        selectedParticipant.avatarUrl
                      }
                      alt={
                        selectedParticipant.displayName
                      }
                    />
                  ) : (
                    <span>
                      {getInitials(
                        selectedParticipant?.displayName,
                        selectedParticipant?.username,
                      )}
                    </span>
                  )}
                </div>
                <div className="aio-messages-chat-person">
                  <strong>
                    {selectedParticipant?.displayName ??
                      "AIO User"}
                  </strong>
                  <span>
                    @
                    {selectedParticipant?.username ??
                      "user"}
                  </span>
                </div>
                {selectedParticipant?.username && (
                  <Link
                    href={`/profile/${encodeURIComponent(
                      selectedParticipant.username,
                    )}`}
                    className="aio-messages-profile-link"
                    aria-label={`View ${selectedParticipant.displayName}'s profile`}
                  >
                    View profile
                    <ArrowUpRight
                      size={15}
                    />
                  </Link>
                )}
              </header>
              <div className="aio-messages-thread">
                {messagesLoading ? (
                  <div className="aio-messages-thread-state">
                    <Loader2
                      size={24}
                      className="aio-messages-spinner"
                    />
                    <strong>
                      Loading conversation
                    </strong>
                    <span>
                      Getting your messages.
                    </span>
                  </div>
                ) : messagesError &&
                  messages.length === 0 ? (
                  <div className="aio-messages-thread-state">
                    <Mail size={26} />
                    <strong>
                      Unable to load conversation
                    </strong>
                    <span>
                      {messagesError}
                    </span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="aio-messages-thread-state">
                    <div className="aio-messages-thread-empty-icon">
                      <MessageCircle
                        size={24}
                      />
                    </div>
                    <strong>
                      Start the conversation
                    </strong>
                    <span>
                      Send the first message to{" "}
                      {selectedParticipant?.displayName ??
                        "this person"}.
                    </span>
                  </div>
                ) : (
                  visibleMessages.map(
                    (message, index) => {
                      const mine =
                        message.senderId ===
                        currentUser?.id;
                      const previousMessage =
                        visibleMessages[
                          index - 1
                        ];
                      const currentDay =
                        formatDayLabel(
                          message.createdAt,
                        );
                      const previousDay =
                        previousMessage
                          ? formatDayLabel(
                              previousMessage.createdAt,
                            )
                          : null;
                      const showDay =
                        index === 0 ||
                        currentDay !==
                          previousDay;
                      const read =
                        mine &&
                        message.readBy.some(
                          (userId) =>
                            userId !==
                            currentUser?.id,
                        );
                      return (
                        <div
                          key={message.id}
                          className="aio-messages-message-block"
                        >
                          {showDay && (
                            <div className="aio-messages-day">
                              <span>
                                {currentDay}
                              </span>
                            </div>
                          )}
                          <div
                            className={`aio-messages-message-row ${
                              mine
                                ? "is-mine"
                                : "is-theirs"
                            }`}
                          >
                            <div className="aio-messages-bubble">
                              {message.content && (
                                <p>
                                  {
                                    message.content
                                  }
                                </p>
                              )}
                              {message.imageUrl && (
                                <img
                                  src={
                                    message.imageUrl
                                  }
                                  alt="Shared in conversation"
                                />
                              )}
                              <div className="aio-messages-message-meta">
                                <time>
                                  {formatMessageTime(
                                    message.createdAt,
                                  )}
                                </time>
                                {mine && (
                                  <CheckCheck
                                    size={13}
                                    aria-label={
                                      read
                                        ? "Read"
                                        : "Sent"
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )
                )}
                <div ref={threadEndRef} />
              </div>
              {messagesError &&
                messages.length > 0 && (
                  <div className="aio-messages-inline-error">
                    {messagesError}
                  </div>
                )}
              <form
                className="aio-messages-composer"
                onSubmit={
                  handleSendMessage
                }
              >
                <div className="aio-messages-composer-field">
                  <input
                    type="text"
                    value={draft}
                    onChange={(event) =>
                      setDraft(
                        event.target.value,
                      )
                    }
                    placeholder={`Message ${
                      selectedParticipant?.displayName ??
                      "AIO user"
                    }...`}
                    maxLength={5000}
                    disabled={sending}
                    aria-label="Message"
                  />
                </div>
                <button
                  type="submit"
                  className="aio-messages-send"
                  disabled={
                    sending ||
                    !draft.trim()
                  }
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2
                      size={18}
                      className="aio-messages-spinner"
                    />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </section>
    </main>
  );
}