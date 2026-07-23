import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlogPostStatus, Prisma } from '@prisma/client';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.blogPost.findMany({
      where: { status: BlogPostStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || post.status !== BlogPostStatus.PUBLISHED) {
      throw new NotFoundException('Blog post not found');
    }
    return post;
  }

  findAllForAdmin() {
    return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOneForAdmin(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async create(dto: CreateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('A post with this slug already exists');

    const status = dto.status ?? BlogPostStatus.DRAFT;
    return this.prisma.blogPost.create({
      data: {
        ...dto,
        status,
        publishedAt: status === BlogPostStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.findOneForAdmin(id);

    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
      if (slugTaken) throw new ConflictException('A post with this slug already exists');
    }

    const data: Prisma.BlogPostUpdateInput = { ...dto };
    // First transition into PUBLISHED sets publishedAt; later edits keep the
    // original publish date rather than bumping it on every content tweak.
    if (dto.status === BlogPostStatus.PUBLISHED && existing.status !== BlogPostStatus.PUBLISHED) {
      data.publishedAt = new Date();
    } else if (dto.status === BlogPostStatus.DRAFT) {
      data.publishedAt = null;
    }

    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOneForAdmin(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { success: true };
  }
}
