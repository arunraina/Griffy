import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { ChatService } from './chat.service';
import { StartConversationDto, SendMessageDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('conversations')
  startConversation(@CurrentUser() user: User, @Body() body: StartConversationDto) {
    return this.chat.getOrCreateConversation(user.id, body.otherUserId);
  }

  @Get('conversations')
  listConversations(@CurrentUser() user: User) {
    return this.chat.listConversations(user.id);
  }

  @Get('conversations/:id')
  getConversation(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chat.getConversation(id, user.id);
  }

  @Get('conversations/:id/messages')
  listMessages(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chat.listMessages(id, user.id);
  }

  @Post('conversations/:id/messages')
  sendMessage(@CurrentUser() user: User, @Param('id') id: string, @Body() body: SendMessageDto) {
    return this.chat.sendMessage(id, user.id, body.body);
  }

  @Patch('conversations/:id/read')
  markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chat.markRead(id, user.id);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: User) {
    return this.chat.unreadCount(user.id);
  }
}
