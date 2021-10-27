import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { isEmpty } from 'lodash';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ConversationService {
  private userService;
  constructor(
    @Inject('user_package') private client: ClientGrpc,

    private httpService: HttpService,
  ) {}
  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  // tra ve tat ca conversation , bao gom lastmesage
  async getByUserId(userId) {
    let member$ = this.httpService.get(
      `${process.env.GROUP_URL}/member/user/${userId}`,
    );

    // all conversation by user
    let member = await lastValueFrom(member$);
    for await (const element of member.data) {
      let lastMessage = await this.getLastMessage(element.conversation._id);

      let avatar$ = await this.httpService.get(
        `${process.env.USER_URL}/${element.conversation.avatar}`,
      );

      let { data } = await lastValueFrom(avatar$);

      element.conversation.avatar = data.avatar ? data.avatar : '';
      if (isEmpty(lastMessage)) {
        element.lastMessage = null;
        continue;
      }

      let member1 = await this.getMember(
        lastMessage.senderId,
        element.conversation._id,
      );

      if (member1) {
        lastMessage.nickName = member1.nickName;
        element.lastMessage = lastMessage;
      }
    }

    return member.data;
  }

  async getDirectConversation(userId1, userId2) {
    let conversation$ = this.httpService.get(
      `${process.env.GROUP_URL}/member/direct?userId1=${userId1}&userId2=${userId2}`,
    );
    let { data } = await lastValueFrom(conversation$);
    return data;
  }

  async createContact({ userId, userId2, nickName, nickName2, type, content }) {
    // tao conversation
    const conversation: any = await this.create({ title: '', type });
    // tao member1 member2
    const member1 = await this.createMember({
      userId,
      conversationId: conversation._id,
      nickName: nickName,
    });
    const member2 = await this.createMember({
      userId: userId2,
      conversationId: conversation._id,
      nickName: nickName2,
    });

    let message$ = await this.httpService.post(
      `${process.env.MESSAGE_URL}/message`,
      { senderId: userId, conversationId: conversation._id, content },
    );
    let message = await lastValueFrom(message$);

    return {
      conversation1: {
        ...member1,
        conversation: { ...conversation, title: nickName2 },
        lastMessage: {
          ...message.data,
          nickName,
        },
      },
      conversation2: {
        ...member2,
        conversation: { ...conversation, title: nickName },
        lastMessage: {
          ...message.data,
          nickName,
        },
      },
    };
  }

  // create member
  async createMember({ userId, conversationId, nickName }) {
    let member$ = this.httpService.post(`${process.env.GROUP_URL}/member`, {
      userId,
      conversationId,
      nickName,
    });
    const { data } = await lastValueFrom(member$);
    return data;
  }
  // async create()
  async create({ title, type }) {
    const conversation$ = this.httpService.post(
      `${process.env.GROUP_URL}/conversation`,
      { title, type },
    );
    const { data } = await lastValueFrom(conversation$);
    return data;
  }

  async getLastMessage(conversationId: string) {
    let message$ = this.httpService.get(
      `${process.env.MESSAGE_URL}/message/last/${conversationId}`,
    );
    let { data } = await lastValueFrom(message$);
    return data;
  }

  async getMember(userId: string, conversationId: string) {
    let member$ = this.httpService.get(
      `${process.env.GROUP_URL}/member?userId=${userId}&conversationId=${conversationId}`,
    );
    let { data } = await lastValueFrom(member$);

    return data;
  }
}
