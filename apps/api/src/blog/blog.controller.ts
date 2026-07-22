import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { BlogService } from './blog.service';
import { AdminService } from '../admin/admin.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  findPublished() {
    return this.blog.findPublished();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blog.findPublishedBySlug(slug);
  }
}

@Controller('admin/blog')
@UseGuards(AuthGuard)
export class AdminBlogController {
  constructor(
    private readonly blog: BlogService,
    private readonly admin: AdminService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: User) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.blog.findAllForAdmin();
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.blog.findOneForAdmin(id);
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() body: CreateBlogPostDto) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.blog.create(body);
  }

  @Patch(':id')
  async update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateBlogPostDto) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.blog.update(id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.blog.remove(id);
  }
}
