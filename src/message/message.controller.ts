import { ConversationService } from './../conversation/conversation.service';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';

@Controller('message')
export class MessageController {
  constructor(
    private httpService: HttpService,
    private converSationService: ConversationService,
  ) {}
  // get message by conversationId
  @Get('/:id')
  async getMessage(@Param('id') id: string, @Query('skip') skip: number) {
    let message$ = await this.httpService.get(
      `${process.env.MESSAGE_URL}/message/${id}?skip=${skip}`,
    );
    const message = await lastValueFrom(message$);
    for await (const element of message.data) {
      let member = await this.converSationService.getMember(
        element.senderId,
        id,
      );
      if (member) {
        element.nickName = member.nickName;
      }
    }
    return {
      status: 200,
      message: 'List message',
      data: message.data,
    };
  }

  @Post()
  async create(@Body() body) {
    const { senderId, conversationId, content } = body;

    let message$ = await this.httpService.post(
      `${process.env.MESSAGE_URL}/message`,
      { senderId, conversationId, content },
    );
    let message = await lastValueFrom(message$);

    return {
      status: 200,
      message: 'send message',
      data: message.data,
    };
  }
}
