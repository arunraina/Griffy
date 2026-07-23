import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PublicProfileType = 'contractor' | 'labour' | 'service-expert';

export interface ProfileLookupResult {
  type: PublicProfileType;
  profileId: string;
}

// Backs the /profile/[userId] resolver route on the web app -- lets someone
// find any professional's canonical page (/contractors/[id], /labour/[id],
// /service-experts/[id]) from just their userId, without needing to know
// which of those three they are. Deliberately doesn't cover the other
// supply-side roles (material-supplier, land-owner, property-seller,
// builder, property-agent) -- none of those have a standalone public
// profile page today, only their listings (materials/land/properties) do.
@Injectable()
export class ProfileLookupService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(userId: string): Promise<ProfileLookupResult | null> {
    const [contractor, labour, serviceExpert] = await Promise.all([
      this.prisma.contractorProfile.findUnique({ where: { userId }, select: { id: true } }),
      this.prisma.labourProfile.findUnique({ where: { userId }, select: { id: true } }),
      this.prisma.serviceExpertProfile.findUnique({ where: { userId }, select: { id: true } }),
    ]);

    if (contractor) return { type: 'contractor', profileId: contractor.id };
    if (labour) return { type: 'labour', profileId: labour.id };
    if (serviceExpert) return { type: 'service-expert', profileId: serviceExpert.id };
    return null;
  }
}
