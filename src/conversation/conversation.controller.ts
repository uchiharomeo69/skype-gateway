import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversation')
export class ConversationController {
  logger = new Logger('conversation controller');

  constructor(private conversationService: ConversationService) {}

  @Get('/user')
  async getByUser(@Res() res) {
    let user = res.locals.user;

    res.send({
      status: 200,
      message: 'list conversation and group by userId',
      data: await this.conversationService.getByUserId(user._id),
    });
  }
  @Get('/last/:id')
  async lastMessage(@Param('id') conversationId: string) {
    return {
      status: 200,
      message: 'last message',
      data: await this.conversationService.getLastMessage(conversationId),
    };
  }
  @Post('/group')
  async createGroup(@Body() body) {
    console.log(body);
  }

  @Post('/direct')
  async createDirectContact(@Body() body) {
    const { userId, userId2, nickName, nickName2, type, content } = body;
    return {
      status: 200,
      message: 'last message',
      data: await this.conversationService.createContact({
        userId,
        userId2,
        nickName,
        nickName2,
        type,
        content,
      }),
    };
  }

  @Get('/friend')
  async getFriend(@Res() res) {
    const { _id } = res.locals.user;

    res.send({
      status: 200,
      message: 'List Friend',
      data: await this.conversationService.getFriendId(_id),
    });
  }
}
