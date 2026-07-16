import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getOrCreateConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }
    const otherUser = await this.prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true } });
    if (!otherUser) throw new NotFoundException('User not found');

    const [userAId, userBId] = [userId, otherUserId].sort();
    const existing = await this.prisma.conversation.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({ data: { userAId, userBId } });
  }

  async listConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true } },
        userB: { select: { id: true, name: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return Promise.all(conversations.map(async (c) => {
      const other = c.userAId === userId ? c.userB : c.userA;
      const unreadCount = await this.prisma.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, readAt: null },
      });
      return {
        id: c.id,
        otherUser: other,
        lastMessage: c.messages[0] ?? null,
        lastMessageAt: c.lastMessageAt,
        unreadCount,
      };
    }));
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.assertParticipant(conversationId, userId);
    const otherUserId = conversation.userAId === userId ? conversation.userBId : conversation.userAId;
    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, avatarUrl: true },
    });
    return { id: conversation.id, otherUser };
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.userAId !== userId && conversation.userBId !== userId) {
      throw new ForbiddenException('Not a participant in this conversation');
    }
    return conversation;
  }

  async listMessages(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async sendMessage(conversationId: string, senderId: string, body: string) {
    const conversation = await this.assertParticipant(conversationId, senderId);

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, body },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: message.createdAt },
    });

    const recipientId = conversation.userAId === senderId ? conversation.userBId : conversation.userAId;
    this.notifications.notify(recipientId, 'chat.message_received', {
      senderName: message.sender.name,
      conversationId,
    }).catch(() => undefined);

    return message;
  }

  async markRead(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: userId },
        conversation: { OR: [{ userAId: userId }, { userBId: userId }] },
      },
    });
    return { count };
  }
}
