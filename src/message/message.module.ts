import { ConversationModule } from './../conversation/conversation.module';
import { ConversationService } from './../conversation/conversation.service';
import { MessageController } from './message.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConversationModule],
  controllers: [MessageController],
})
export class MessageModule {}
