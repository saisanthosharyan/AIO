"use client";

import {
  Loader2,
  Mail,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

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

export default function MessagesPage() {
  const [
    conversations,
    setConversations,
  ] = useState<ConversationItem[]>([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<ConversationItem | null>(
    null,
  );

  const [messages, setMessages] =
    useState<MessageItem[]>([]);

  const [currentUser, setCurrentUser] =
    useState<UserProfile | null>(null);

  const [draft, setDraft] =
    useState("");

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

  /* ---------------------------------------------------------------------- */
  /* New Message state                                                      */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Initial page loading                                                   */
  /* ---------------------------------------------------------------------- */

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      const [
        user,
        conversationList,
      ] = await Promise.all([
        getCurrentUser(),
        getConversations(),
      ]);

      setCurrentUser(user);
      setConversations(
        conversationList,
      );

      if (
        conversationList.length > 0
      ) {
        setSelectedConversation(
          conversationList[0],
        );
      } else {
        setSelectedConversation(null);
      }
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

  /* ---------------------------------------------------------------------- */
  /* Load selected conversation                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadConversation() {
      try {
        setMessagesLoading(true);
        setMessagesError("");

        const result =
          await getMessages(
            selectedConversation!.id,
          );

        if (cancelled) {
          return;
        }

        setMessages(result);

        await markConversationAsRead(
          selectedConversation!.id,
        );

        if (cancelled) {
          return;
        }

        setMessages(
          (currentMessages) =>
            currentMessages.map(
              (message) => {
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
              },
            ),
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
    selectedConversation,
    currentUser,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Search users                                                           */
  /* ---------------------------------------------------------------------- */

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

    const timeoutId =
      window.setTimeout(
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
                (user) => {
                  const userId =
                    user.id;

                  return (
                    userId !==
                    currentUser?.id
                  );
                },
              ),
            );
          } catch (err) {
            console.error(
              "User search error:",
              err,
            );

            if (!cancelled) {
              setUserSearchResults(
                [],
              );

              setUserSearchError(
                err instanceof Error
                  ? err.message
                  : "Failed to search users.",
              );
            }
          } finally {
            if (!cancelled) {
              setUserSearchLoading(
                false,
              );
            }
          }
        },
        300,
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    newMessageOpen,
    userSearchQuery,
    currentUser,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Conversation selection                                                 */
  /* ---------------------------------------------------------------------- */

  function handleSelectConversation(
    conversation: ConversationItem,
  ) {
    setSelectedConversation(
      conversation,
    );

    setNewMessageOpen(false);
    setMessagesError("");
  }

  /* ---------------------------------------------------------------------- */
  /* Start/open conversation                                                */
  /* ---------------------------------------------------------------------- */

  async function handleStartConversation(
    user: UserProfile,
  ) {
    const participantId =
      user.id;

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

          if (
            existingIndex !== -1
          ) {
            const updated = [
              ...currentConversations,
            ];

            updated[
              existingIndex
            ] = conversation;

            const [
              selectedItem,
            ] = updated.splice(
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

      setNewMessageOpen(false);
      setUserSearchQuery("");
      setUserSearchResults([]);
      setUserSearchError("");
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
      setStartingConversation(
        null,
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Send message                                                           */
  /* ---------------------------------------------------------------------- */

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

      const message =
        await sendMessage(
          selectedConversation.id,
          content,
        );

      setMessages(
        (currentMessages) => [
          ...currentMessages,
          message,
        ],
      );

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
              const firstTime =
                new Date(
                  first.lastMessageAt ??
                    first.updatedAt,
                ).getTime();

              const secondTime =
                new Date(
                  second.lastMessageAt ??
                    second.updatedAt,
                ).getTime();

              return (
                secondTime -
                firstTime
              );
            },
          );
        },
      );

      setSelectedConversation(
        (currentConversation) =>
          currentConversation
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

  /* ---------------------------------------------------------------------- */
  /* Loading/error states                                                   */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <main className="messages-page">
        <div className="messages-state">
          <Loader2
            size={28}
            className="messages-spinner"
          />

          <span>
            Loading messages...
          </span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="messages-page">
        <div className="messages-state">
          <Mail size={32} />

          <strong>
            Unable to load messages
          </strong>

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              void loadPage()
            }
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Page                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="messages-page">
      <header className="messages-header">
        <div>
          <h1>Messages</h1>

          <p>
            Private conversations
            across AIO.
          </p>
        </div>

        <button
          type="button"
          className="messages-new-button"
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
      </header>

      {newMessageOpen && (
        <section className="messages-new-panel">
          <div className="messages-new-panel-header">
            <div>
              <strong>
                Start a conversation
              </strong>

              <span>
                Search for someone on
                AIO.
              </span>
            </div>

            <button
              type="button"
              className="messages-new-close"
              aria-label="Close new message"
              onClick={() => {
                setNewMessageOpen(false);
                setUserSearchQuery("");
                setUserSearchResults([]);
                setUserSearchError("");
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="messages-user-search">
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
                className="messages-spinner"
              />
            )}
          </div>

          {userSearchError && (
            <div className="messages-search-error">
              {userSearchError}
            </div>
          )}

          {userSearchQuery.trim() &&
            !userSearchLoading &&
            !userSearchError &&
            userSearchResults.length ===
              0 && (
              <div className="messages-search-empty">
                No users found.
              </div>
            )}

          {userSearchResults.length >
            0 && (
            <div className="messages-user-results">
              {userSearchResults.map(
                (user) => {
                  const userId =
                    user.id ||
                    user.username;

                  const isStarting =
                    startingConversation ===
                    user.id;

                  return (
                    <button
                      key={userId}
                      type="button"
                      className="messages-user-result"
                      disabled={
                        Boolean(
                          startingConversation,
                        )
                      }
                      onClick={() =>
                        void handleStartConversation(
                          user,
                        )
                      }
                    >
                      <div className="messages-avatar">
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
                            {user.displayName
                              ?.charAt(0)
                              .toUpperCase() ||
                              user.username
                                ?.charAt(0)
                                .toUpperCase() ||
                              "?"}
                          </span>
                        )}
                      </div>

                      <div className="messages-user-result-info">
                        <strong>
                          {user.displayName}
                        </strong>

                        <span>
                          @{user.username}
                        </span>
                      </div>

                      <div className="messages-user-result-action">
                        {isStarting ? (
                          <Loader2
                            size={18}
                            className="messages-spinner"
                          />
                        ) : (
                          <span>
                            Message
                          </span>
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

      <section className="messages-layout">
        <aside className="messages-inbox">
          <div className="messages-inbox-header">
            <strong>
              Conversations
            </strong>

            <span>
              {conversations.length}
            </span>
          </div>

          {conversations.length ===
          0 ? (
            <div className="messages-empty-inbox">
              <Mail size={28} />

              <strong>
                No conversations yet
              </strong>

              <span>
                Start chatting with
                someone on AIO.
              </span>

              <button
                type="button"
                className="messages-empty-start"
                onClick={() =>
                  setNewMessageOpen(true)
                }
              >
                <Plus size={17} />
                Start a conversation
              </button>
            </div>
          ) : (
            <div className="messages-conversation-list">
              {conversations.map(
                (conversation) => {
                  const participant =
                    conversation.participant;

                  const active =
                    selectedConversation?.id ===
                    conversation.id;

                  return (
                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      className={`messages-conversation${
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
                      <div className="messages-avatar">
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
                            {participant?.displayName
                              ?.charAt(0)
                              .toUpperCase() ??
                              "?"}
                          </span>
                        )}
                      </div>

                      <div className="messages-conversation-content">
                        <strong>
                          {participant?.displayName ??
                            "AIO User"}
                        </strong>

                        <span>
                          {conversation.lastMessageText ??
                            "Start a conversation"}
                        </span>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
        </aside>

        <section className="messages-chat">
          {!selectedConversation ? (
            <div className="messages-chat-empty">
              <Mail size={38} />

              <h2>
                Your messages
              </h2>

              <p>
                Select a conversation
                or start a new one.
              </p>

              <button
                type="button"
                className="messages-empty-start"
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
              <header className="messages-chat-header">
                <div className="messages-avatar">
                  {selectedConversation
                    .participant
                    ?.avatarUrl ? (
                    <img
                      src={
                        selectedConversation
                          .participant
                          .avatarUrl
                      }
                      alt={
                        selectedConversation
                          .participant
                          .displayName
                      }
                    />
                  ) : (
                    <span>
                      {selectedConversation
                        .participant
                        ?.displayName
                        ?.charAt(0)
                        .toUpperCase() ??
                        "?"}
                    </span>
                  )}
                </div>

                <div>
                  <strong>
                    {selectedConversation
                      .participant
                      ?.displayName ??
                      "AIO User"}
                  </strong>

                  <span>
                    @
                    {selectedConversation
                      .participant
                      ?.username ??
                      "user"}
                  </span>
                </div>
              </header>

              <div className="messages-thread">
                {messagesLoading ? (
                  <div className="messages-thread-state">
                    <Loader2
                      size={24}
                      className="messages-spinner"
                    />

                    <span>
                      Loading conversation...
                    </span>
                  </div>
                ) : messagesError &&
                  messages.length ===
                    0 ? (
                  <div className="messages-thread-state">
                    <strong>
                      Unable to load
                      conversation
                    </strong>

                    <span>
                      {messagesError}
                    </span>
                  </div>
                ) : messages.length ===
                  0 ? (
                  <div className="messages-thread-state">
                    <Mail size={28} />

                    <strong>
                      Start the conversation
                    </strong>

                    <span>
                      Send the first
                      message.
                    </span>
                  </div>
                ) : (
                  messages.map(
                    (message) => {
                      const mine =
                        message.senderId ===
                        currentUser?.id;

                      return (
                        <div
                          key={
                            message.id
                          }
                          className={`messages-message-row ${
                            mine
                              ? "is-mine"
                              : "is-theirs"
                          }`}
                        >
                          <div className="messages-bubble">
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
                                alt=""
                              />
                            )}

                            <span className="messages-message-time">
                              {new Date(
                                message.createdAt,
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute:
                                    "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )
                )}
              </div>

              {messagesError &&
                messages.length > 0 && (
                  <div className="messages-inline-error">
                    {messagesError}
                  </div>
                )}

              <form
                className="messages-composer"
                onSubmit={
                  handleSendMessage
                }
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(event) =>
                    setDraft(
                      event.target.value,
                    )
                  }
                  placeholder="Write a message..."
                  maxLength={5000}
                  disabled={sending}
                  aria-label="Message"
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !draft.trim()
                  }
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2
                      size={18}
                      className="messages-spinner"
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