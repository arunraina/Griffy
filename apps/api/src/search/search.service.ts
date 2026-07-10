import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SearchType = 'contractors' | 'labour' | 'experts' | 'materials' | 'properties' | 'lands';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  href: string;
  emoji: string;
}

interface RawRow {
  id: string;
  title: string | null;
  subtitle: string | null;
  price_raw?: string | null;
  unit?: string | null;
}

const ALL_TYPES: SearchType[] = ['contractors', 'labour', 'experts', 'materials', 'properties', 'lands'];

const EMOJI: Record<SearchType, string> = {
  contractors: '🏗️',
  labour: '👷',
  experts: '⚡',
  materials: '🧱',
  properties: '🏠',
  lands: '🌍',
};

function hrefFor(type: SearchType, id: string): string {
  switch (type) {
    case 'contractors': return `/contractors/${id}`;
    case 'labour': return `/labour/${id}`;
    case 'experts': return `/service-experts/${id}`;
    case 'materials': return `/materials/${id}`;
    case 'properties': return `/properties/${id}`;
    case 'lands': return `/land/${id}`;
  }
}

function toItem(row: RawRow, type: SearchType): SearchResultItem {
  const price = row.price_raw != null
    ? `₹${Number(row.price_raw).toLocaleString('en-IN')}${row.unit ? ` ${row.unit}` : ''}`
    : undefined;
  return {
    id: row.id,
    title: row.title ?? '',
    subtitle: row.subtitle ?? '',
    price,
    href: hrefFor(type, row.id),
    emoji: EMOJI[type],
  };
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchAll(q: string): Promise<Record<SearchType, SearchResultItem[]>> {
    const trimmed = q.trim();
    if (!trimmed) {
      return { contractors: [], labour: [], experts: [], materials: [], properties: [], lands: [] };
    }

    const results = await Promise.all(ALL_TYPES.map((t) => this.searchOneType(t, trimmed, 5, 0)));
    return ALL_TYPES.reduce((acc, type, i) => {
      acc[type] = results[i];
      return acc;
    }, {} as Record<SearchType, SearchResultItem[]>);
  }

  async searchType(type: SearchType, q: string, page: number, pageSize: number) {
    const trimmed = q.trim();
    if (!trimmed) return { items: [], total: 0, page, pageSize };

    const offset = (page - 1) * pageSize;
    const rankedCount = await this.countRanked(type, trimmed);
    if (rankedCount > 0) {
      const items = await this.queryRanked(type, trimmed, pageSize, offset);
      return { items: items.map((r) => toItem(r, type)), total: rankedCount, page, pageSize };
    }

    const ilikeCount = await this.countIlike(type, trimmed);
    const items = await this.queryIlike(type, trimmed, pageSize, offset);
    return { items: items.map((r) => toItem(r, type)), total: ilikeCount, page, pageSize };
  }

  private async searchOneType(type: SearchType, q: string, limit: number, offset: number): Promise<SearchResultItem[]> {
    const ranked = await this.queryRanked(type, q, limit, offset);
    if (ranked.length > 0) return ranked.map((r) => toItem(r, type));
    const fallback = await this.queryIlike(type, q, limit, offset);
    return fallback.map((r) => toItem(r, type));
  }

  private queryRanked(type: SearchType, q: string, limit: number, offset: number): Promise<RawRow[]> {
    switch (type) {
      case 'contractors':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT cp.id::text as id, u.name as title,
            concat_ws(' · ', cp.contractor_type, cp.trade_skills[1]) as subtitle
          FROM contractor_profiles cp
          JOIN users u ON u.id = cp.user_id
          WHERE cp.approval_status = 'APPROVED' AND cp.is_available = true AND u.is_suspended = false
            AND cp.search_vector @@ websearch_to_tsquery('english', ${q})
          ORDER BY ts_rank(cp.search_vector, websearch_to_tsquery('english', ${q})) DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'labour':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT lp.id::text as id, u.name as title, lp.skill_type as subtitle
          FROM labour_profiles lp
          JOIN users u ON u.id = lp.user_id
          WHERE lp.approval_status = 'APPROVED' AND lp.is_available = true AND u.is_suspended = false
            AND lp.search_vector @@ websearch_to_tsquery('english', ${q})
          ORDER BY ts_rank(lp.search_vector, websearch_to_tsquery('english', ${q})) DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'experts':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT sep.id::text as id, u.name as title, sep.expertise_type as subtitle
          FROM service_expert_profiles sep
          JOIN users u ON u.id = sep.user_id
          WHERE sep.approval_status = 'APPROVED' AND sep.is_available = true AND u.is_suspended = false
            AND sep.search_vector @@ websearch_to_tsquery('english', ${q})
          ORDER BY ts_rank(sep.search_vector, websearch_to_tsquery('english', ${q})) DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'materials':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT m.id::text as id, m.name as title,
            concat_ws(' · ', m.category, m.subcategory) as subtitle,
            m.price::text as price_raw, m.unit as unit
          FROM materials m
          JOIN material_supplier_profiles sp ON sp.id = m.supplier_id
          JOIN users u ON u.id = sp.user_id
          WHERE m.is_hidden = false AND u.is_suspended = false
            AND m.search_vector @@ websearch_to_tsquery('english', ${q})
          ORDER BY ts_rank(m.search_vector, websearch_to_tsquery('english', ${q})) DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'properties':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT p.id::text as id, p.title as title,
            concat_ws(', ', p.location, p.city) as subtitle,
            p.price::text as price_raw
          FROM properties p
          JOIN property_seller_profiles sp ON sp.id = p.seller_id
          JOIN users u ON u.id = sp.user_id
          WHERE p.is_available = true AND p.is_hidden = false AND u.is_suspended = false
            AND p.search_vector @@ websearch_to_tsquery('english', ${q})
          ORDER BY ts_rank(p.search_vector, websearch_to_tsquery('english', ${q})) DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'lands':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT l.id::text as id, l.title as title,
            concat_ws(', ', l.location, l.city) as subtitle,
            l.price::text as price_raw
          FROM lands l
          JOIN land_owner_profiles op ON op.id = l.owner_id
          JOIN users u ON u.id = op.user_id
          WHERE l.is_available = true AND l.is_hidden = false AND u.is_suspended = false
            AND l.search_vector @@ websearch_to_tsquery('english', ${q})
          ORDER BY ts_rank(l.search_vector, websearch_to_tsquery('english', ${q})) DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
    }
  }

  private queryIlike(type: SearchType, q: string, limit: number, offset: number): Promise<RawRow[]> {
    const like = `%${q}%`;
    switch (type) {
      case 'contractors':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT cp.id::text as id, u.name as title,
            concat_ws(' · ', cp.contractor_type, cp.trade_skills[1]) as subtitle
          FROM contractor_profiles cp
          JOIN users u ON u.id = cp.user_id
          WHERE cp.approval_status = 'APPROVED' AND cp.is_available = true AND u.is_suspended = false
            AND (u.name ILIKE ${like} OR cp.contractor_type ILIKE ${like} OR cp.bio ILIKE ${like})
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'labour':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT lp.id::text as id, u.name as title, lp.skill_type as subtitle
          FROM labour_profiles lp
          JOIN users u ON u.id = lp.user_id
          WHERE lp.approval_status = 'APPROVED' AND lp.is_available = true AND u.is_suspended = false
            AND (u.name ILIKE ${like} OR lp.skill_type ILIKE ${like} OR lp.bio ILIKE ${like})
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'experts':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT sep.id::text as id, u.name as title, sep.expertise_type as subtitle
          FROM service_expert_profiles sep
          JOIN users u ON u.id = sep.user_id
          WHERE sep.approval_status = 'APPROVED' AND sep.is_available = true AND u.is_suspended = false
            AND (u.name ILIKE ${like} OR sep.expertise_type ILIKE ${like} OR sep.bio ILIKE ${like})
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'materials':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT m.id::text as id, m.name as title,
            concat_ws(' · ', m.category, m.subcategory) as subtitle,
            m.price::text as price_raw, m.unit as unit
          FROM materials m
          JOIN material_supplier_profiles sp ON sp.id = m.supplier_id
          JOIN users u ON u.id = sp.user_id
          WHERE m.is_hidden = false AND u.is_suspended = false
            AND (m.name ILIKE ${like} OR m.category ILIKE ${like} OR m.subcategory ILIKE ${like} OR m.description ILIKE ${like})
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'properties':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT p.id::text as id, p.title as title,
            concat_ws(', ', p.location, p.city) as subtitle,
            p.price::text as price_raw
          FROM properties p
          JOIN property_seller_profiles sp ON sp.id = p.seller_id
          JOIN users u ON u.id = sp.user_id
          WHERE p.is_available = true AND p.is_hidden = false AND u.is_suspended = false
            AND (p.title ILIKE ${like} OR p.location ILIKE ${like} OR p.city ILIKE ${like} OR p.description ILIKE ${like})
          LIMIT ${limit} OFFSET ${offset}
        `;
      case 'lands':
        return this.prisma.$queryRaw<RawRow[]>`
          SELECT l.id::text as id, l.title as title,
            concat_ws(', ', l.location, l.city) as subtitle,
            l.price::text as price_raw
          FROM lands l
          JOIN land_owner_profiles op ON op.id = l.owner_id
          JOIN users u ON u.id = op.user_id
          WHERE l.is_available = true AND l.is_hidden = false AND u.is_suspended = false
            AND (l.title ILIKE ${like} OR l.location ILIKE ${like} OR l.city ILIKE ${like} OR l.description ILIKE ${like})
          LIMIT ${limit} OFFSET ${offset}
        `;
    }
  }

  private async countRanked(type: SearchType, q: string): Promise<number> {
    const rows = await this.countRankedRaw(type, q);
    return Number(rows[0]?.count ?? 0);
  }

  private countRankedRaw(type: SearchType, q: string): Promise<{ count: bigint }[]> {
    switch (type) {
      case 'contractors':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM contractor_profiles cp
          JOIN users u ON u.id = cp.user_id
          WHERE cp.approval_status = 'APPROVED' AND cp.is_available = true AND u.is_suspended = false
            AND cp.search_vector @@ websearch_to_tsquery('english', ${q})
        `;
      case 'labour':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM labour_profiles lp
          JOIN users u ON u.id = lp.user_id
          WHERE lp.approval_status = 'APPROVED' AND lp.is_available = true AND u.is_suspended = false
            AND lp.search_vector @@ websearch_to_tsquery('english', ${q})
        `;
      case 'experts':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM service_expert_profiles sep
          JOIN users u ON u.id = sep.user_id
          WHERE sep.approval_status = 'APPROVED' AND sep.is_available = true AND u.is_suspended = false
            AND sep.search_vector @@ websearch_to_tsquery('english', ${q})
        `;
      case 'materials':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM materials m
          JOIN material_supplier_profiles sp ON sp.id = m.supplier_id
          JOIN users u ON u.id = sp.user_id
          WHERE m.is_hidden = false AND u.is_suspended = false
            AND m.search_vector @@ websearch_to_tsquery('english', ${q})
        `;
      case 'properties':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM properties p
          JOIN property_seller_profiles sp ON sp.id = p.seller_id
          JOIN users u ON u.id = sp.user_id
          WHERE p.is_available = true AND p.is_hidden = false AND u.is_suspended = false
            AND p.search_vector @@ websearch_to_tsquery('english', ${q})
        `;
      case 'lands':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM lands l
          JOIN land_owner_profiles op ON op.id = l.owner_id
          JOIN users u ON u.id = op.user_id
          WHERE l.is_available = true AND l.is_hidden = false AND u.is_suspended = false
            AND l.search_vector @@ websearch_to_tsquery('english', ${q})
        `;
    }
  }

  private async countIlike(type: SearchType, q: string): Promise<number> {
    const like = `%${q}%`;
    const rows = await this.countIlikeRaw(type, like);
    return Number(rows[0]?.count ?? 0);
  }

  private countIlikeRaw(type: SearchType, like: string): Promise<{ count: bigint }[]> {
    switch (type) {
      case 'contractors':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM contractor_profiles cp
          JOIN users u ON u.id = cp.user_id
          WHERE cp.approval_status = 'APPROVED' AND cp.is_available = true AND u.is_suspended = false
            AND (u.name ILIKE ${like} OR cp.contractor_type ILIKE ${like} OR cp.bio ILIKE ${like})
        `;
      case 'labour':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM labour_profiles lp
          JOIN users u ON u.id = lp.user_id
          WHERE lp.approval_status = 'APPROVED' AND lp.is_available = true AND u.is_suspended = false
            AND (u.name ILIKE ${like} OR lp.skill_type ILIKE ${like} OR lp.bio ILIKE ${like})
        `;
      case 'experts':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM service_expert_profiles sep
          JOIN users u ON u.id = sep.user_id
          WHERE sep.approval_status = 'APPROVED' AND sep.is_available = true AND u.is_suspended = false
            AND (u.name ILIKE ${like} OR sep.expertise_type ILIKE ${like} OR sep.bio ILIKE ${like})
        `;
      case 'materials':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM materials m
          JOIN material_supplier_profiles sp ON sp.id = m.supplier_id
          JOIN users u ON u.id = sp.user_id
          WHERE m.is_hidden = false AND u.is_suspended = false
            AND (m.name ILIKE ${like} OR m.category ILIKE ${like} OR m.subcategory ILIKE ${like} OR m.description ILIKE ${like})
        `;
      case 'properties':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM properties p
          JOIN property_seller_profiles sp ON sp.id = p.seller_id
          JOIN users u ON u.id = sp.user_id
          WHERE p.is_available = true AND p.is_hidden = false AND u.is_suspended = false
            AND (p.title ILIKE ${like} OR p.location ILIKE ${like} OR p.city ILIKE ${like} OR p.description ILIKE ${like})
        `;
      case 'lands':
        return this.prisma.$queryRaw`
          SELECT count(*)::bigint as count FROM lands l
          JOIN land_owner_profiles op ON op.id = l.owner_id
          JOIN users u ON u.id = op.user_id
          WHERE l.is_available = true AND l.is_hidden = false AND u.is_suspended = false
            AND (l.title ILIKE ${like} OR l.location ILIKE ${like} OR l.city ILIKE ${like} OR l.description ILIKE ${like})
        `;
    }
  }
}
