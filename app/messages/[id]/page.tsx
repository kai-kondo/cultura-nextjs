'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  createOrGetThread,
  listenMessages,
  listenThreads,
  sendTextMessage,
  markMessagesAsRead,
  type ChatMessage,
  type ChatThread,
} from '@/lib/message-actions';
import { auth, db } from '@/lib/firebase';
import {
  Messages,
  type MessageConversationListItem,
  type MessageParticipant,
  type MessageThread,
  type MessageItem,
} from '@/components/Messages';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CulturaLogo } from '@/components/CulturaLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PLACEHOLDER_AVATAR = '/placeholder-avatar.png';

type UserType = 'family' | 'aupair' | null;

function buildMe(user: User, userType: Exclude<UserType, null>): MessageParticipant {
  if (userType === 'family') {
    return {
      id: user.uid,
      name: user.displayName || 'Your Family',
      avatar: user.photoURL || PLACEHOLDER_AVATAR,
      subtitle: 'Host Family',
    };
  }

  return {
    id: user.uid,
    name: user.displayName || 'You',
    avatar: user.photoURL || PLACEHOLDER_AVATAR,
    subtitle: 'Au Pair',
  };
}

function buildAuPairParticipant(profileId: string, data: Record<string, any>): MessageParticipant {
  const city = data?.currentLocation?.city;
  const country = data?.currentLocation?.country;
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const firstSkill = skills[0]?.name;
  const locationLabel = [country, city].filter(Boolean).join(' • ');
  const subtitleParts = [
    locationLabel ? `📍 ${locationLabel}` : null,
    firstSkill ? `Au Pair (${firstSkill})` : 'Au Pair',
  ].filter(Boolean);

  return {
    id: data?.userId || profileId,
    name: data?.name || 'Au Pair',
    avatar: data?.profileImage || PLACEHOLDER_AVATAR,
    subtitle: subtitleParts.join(' • '),
  };
}

function buildFamilyParticipant(profileId: string, data: Record<string, any>): MessageParticipant {
  const city = data?.location?.city;
  const country = data?.location?.country;
  const childCount = Array.isArray(data?.familyMembers?.children)
    ? data.familyMembers.children.length
    : 0;
  const locationLabel = [country, city].filter(Boolean).join(' • ');
  const subtitleParts = [
    locationLabel ? `📍 ${locationLabel}` : null,
    childCount > 0 ? `${childCount} kid${childCount > 1 ? 's' : ''}` : 'Host Family',
  ].filter(Boolean);

  return {
    id: data?.userId || profileId,
    name: data?.familyName || 'Host Family',
    avatar: data?.profileImage || PLACEHOLDER_AVATAR,
    subtitle: subtitleParts.join(' • '),
  };
}

type ResolvedParticipant = {
  participant: MessageParticipant;
  profilePath: string | null;
};

async function resolveParticipantByProfileDocId(profileDocId: string): Promise<ResolvedParticipant | null> {
  const auPairRef = doc(db, 'auPairProfiles', profileDocId);
  const auPairSnap = await getDoc(auPairRef);

  if (auPairSnap.exists()) {
    return {
      participant: buildAuPairParticipant(profileDocId, auPairSnap.data() as Record<string, any>),
      profilePath: `/profile/${profileDocId}`,
    };
  }

  const familyRef = doc(db, 'familyProfiles', profileDocId);
  const familySnap = await getDoc(familyRef);

  if (familySnap.exists()) {
    return {
      participant: buildFamilyParticipant(profileDocId, familySnap.data() as Record<string, any>),
      profilePath: `/profile/${profileDocId}`,
    };
  }

  return null;
}

async function resolveParticipantByUserId(userId: string): Promise<ResolvedParticipant | null> {
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return null;

  const profileRef = userSnap.data()?.profileRef as string | undefined;
  if (!profileRef) return null;

  const profileDocId = profileRef.includes('/')
    ? profileRef.split('/').pop() || null
    : profileRef;

  if (!profileDocId) return null;

  return resolveParticipantByProfileDocId(profileDocId);
}

async function resolveOtherParticipant(routeId: string): Promise<ResolvedParticipant> {
  const byProfileDocId = await resolveParticipantByProfileDocId(routeId);
  if (byProfileDocId) return byProfileDocId;

  const byUserId = await resolveParticipantByUserId(routeId);
  if (byUserId) return byUserId;

  return {
    participant: {
      id: routeId,
      name: 'Cultura Member',
      avatar: PLACEHOLDER_AVATAR,
      subtitle: 'Cultura member',
    },
    profilePath: null,
  };
}

function mapFirestoreMessagesToUi(messages: ChatMessage[], myUid: string): MessageItem[] {
  return messages.map((message) => ({
    id: message.id,
    fromId: message.senderId,
    text: message.text || '',
    imageUrl: message.imageUrl || null,
    createdAt: message.createdAt?.toDate().toISOString() || new Date(0).toISOString(),
    read: message.senderId === myUid ? message.readBy.includes(myUid) || message.readBy.length > 1 : true,
  }));
}

function chatThreadToConversationRow(
  thread: ChatThread,
  meId: string,
  activeThreadId: string | null,
  activeUnread: number,
  fallbackAvatar: string
): MessageConversationListItem {
  const ids = thread.participantIds;
  const otherId = Array.isArray(ids) ? ids.find((id) => id !== meId) ?? ids[0] : meId;
  const summary = thread.participantSummary?.[otherId];
  const lastAt =
    thread.lastMessageAt?.toDate?.()?.toISOString() ??
    thread.updatedAt?.toDate?.()?.toISOString() ??
    new Date(0).toISOString();

  return {
    threadId: thread.id,
    other: {
      id: otherId,
      name: summary?.name ?? 'Member',
      avatar: summary?.avatar ?? fallbackAvatar,
      subtitle: summary?.subtitle,
    },
    lastPreview: thread.lastMessageText ?? '',
    lastMessageAtIso: lastAt,
    unread: thread.id === activeThreadId ? activeUnread : 0,
  };
}

function chatThreadToUiThread(
  thread: ChatThread,
  me: MessageParticipant,
  activeThreadId: string | null,
  activeOther: MessageParticipant | null,
  activeMessages: ChatMessage[],
  activeUnread: number,
  fallbackAvatar: string
): MessageThread {
  const ids = Array.isArray(thread.participantIds) ? thread.participantIds : [];
  const otherId = ids.find((id) => id !== me.id) ?? ids[0] ?? '';
  const summary = thread.participantSummary?.[otherId];

  const inferredOther: MessageParticipant = {
    id: otherId,
    name: summary?.name ?? 'Member',
    avatar: summary?.avatar ?? fallbackAvatar,
    subtitle: summary?.subtitle,
  };

  const isActive = thread.id === activeThreadId;

  return {
    id: thread.id,
    participants: [me, isActive && activeOther ? activeOther : inferredOther],
    lastMessageAt:
      thread.lastMessageAt?.toDate?.()?.toISOString() ??
      thread.updatedAt?.toDate?.()?.toISOString() ??
      new Date(0).toISOString(),
    unread: isActive ? activeUnread : 0,
    messages: isActive ? mapFirestoreMessagesToUi(activeMessages, me.id) : [],
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [userType, setUserType] = useState<UserType>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [other, setOther] = useState<MessageParticipant | null>(null);
  const [otherProfilePath, setOtherProfilePath] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [threadListenErrorCode, setThreadListenErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const storedType = localStorage.getItem('userType') as UserType;
    if (!storedType) {
      router.push('/');
      return;
    }
    setUserType(storedType);
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, [router]);

  const me = useMemo(() => {
    if (!firebaseUser || !userType) return null;
    return buildMe(firebaseUser, userType);
  }, [firebaseUser, userType]);

  useEffect(() => {
    if (!me?.id) return;
    setThreadListenErrorCode(null);
    const unsub = listenThreads(
      me.id,
      (items) => {
        setChatThreads(items);
        if (items.length > 0) {
          setThreadListenErrorCode(null);
        }
      },
      (errorCode) => {
        setThreadListenErrorCode(errorCode);
      }
    );
    return () => unsub();
  }, [me?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadOtherParticipant = async () => {
      try {
        const resolved = await resolveOtherParticipant(profileId);

        if (!cancelled) {
          setOther(resolved.participant);
          setOtherProfilePath(resolved.profilePath);
        }
      } catch (error) {
        console.error('Failed to load participant profile:', error);
        if (!cancelled) {
          setOther({
            id: profileId,
            name: 'Cultura Member',
            avatar: PLACEHOLDER_AVATAR,
            subtitle: 'Cultura member',
          });
          setOtherProfilePath(null);
        }
      }
    };

    void loadOtherParticipant();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    if (!me || !other) return;

    let unsubscribeMessages: (() => void) | undefined;
    let cancelled = false;

    const setup = async () => {
      try {
        setLoading(true);
        const createdThreadId = await createOrGetThread({
          me,
          other,
        });

        if (cancelled) return;

        setThreadId(createdThreadId);

        unsubscribeMessages = listenMessages(createdThreadId, (items) => {
          if (cancelled) return;
          setMessages(items);
        });
      } catch (error) {
        console.error('Failed to initialize thread:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
      unsubscribeMessages?.();
    };
  }, [me, other]);

  useEffect(() => {
    if (!threadId || !firebaseUser || messages.length === 0) return;
    void markMessagesAsRead(threadId, firebaseUser.uid).catch((error) => {
      console.error('Failed to mark messages as read:', error);
    });
  }, [threadId, firebaseUser, messages]);

  const handleBack = () => {
    router.push('/home');
  };

  const handleOpenProfileFromMessage = () => {
    if (otherProfilePath) {
      router.push(otherProfilePath);
      return;
    }

    if (profileId) {
      router.push(`/profile/${profileId}`);
    }
  };

  const handleMobileNavigation = (screen: 'home' | 'community' | 'messages' | 'profile') => {
    if (screen === 'profile') {
      router.push('/profile/edit');
    } else if (screen === 'messages') {
      router.push(`/messages/${profileId}`);
    } else if (screen === 'community') {
      router.push('/community');
    } else {
      router.push('/home');
    }
  };

  const handleSendMessage = async ({ threadId, text }: { threadId: string; text: string }) => {
    if (!firebaseUser) return;

    try {
      setSending(true);
      await sendTextMessage({
        threadId,
        senderId: firebaseUser.uid,
        text,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const myUid = me?.id ?? '';
  const activeUnread = useMemo(
    () =>
      myUid
        ? messages.filter(
            (message) => message.senderId !== myUid && !message.readBy.includes(myUid)
          ).length
        : 0,
    [messages, myUid]
  );

  const conversationList = useMemo((): MessageConversationListItem[] => {
    if (!myUid) return [];
    return chatThreads.map((t) =>
      chatThreadToConversationRow(t, myUid, threadId, activeUnread, PLACEHOLDER_AVATAR)
    );
  }, [chatThreads, myUid, threadId, activeUnread]);

  const threads: MessageThread[] = useMemo(() => {
    if (!me) return [];

    if (chatThreads.length === 0) {
      if (!threadId || !other) return [];

      return [
        {
          id: threadId,
          participants: [me, other],
          lastMessageAt:
            messages[messages.length - 1]?.createdAt?.toDate().toISOString() || new Date().toISOString(),
          unread: activeUnread,
          messages: mapFirestoreMessagesToUi(messages, me.id),
        },
      ];
    }

    return chatThreads.map((thread) =>
      chatThreadToUiThread(
        thread,
        me,
        threadId,
        other,
        messages,
        activeUnread,
        PLACEHOLDER_AVATAR
      )
    );
  }, [me, chatThreads, threadId, other, messages, activeUnread]);

  if (!userType || !me || !other) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 p-4 pb-20 lg:pb-4">
      <div className="mx-auto max-w-7xl">
        {threadListenErrorCode ? (
          <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Debug: listenThreads error code = <span className="font-semibold">{threadListenErrorCode}</span>
          </div>
        ) : null}
        <Messages
          me={me}
          threads={threads}
          activeThreadId={threadId || undefined}
          loading={loading}
          sending={sending}
          onSendMessage={handleSendMessage}
          onOpenProfile={() => handleOpenProfileFromMessage()}
          conversationList={conversationList}
          onSelectConversation={(routeId) => router.push(`/messages/${routeId}`)}
        />
      </div>
      <MobileBottomNav activeScreen="messages" onNavigate={handleMobileNavigation} />
    </div>
  );
}
