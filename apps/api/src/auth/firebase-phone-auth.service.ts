import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import ws from 'ws';

export interface OtpSession {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class FirebasePhoneAuthService {
  private readonly supabase: SupabaseClient;
  private readonly firebaseApp: admin.app.App;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { realtime: { transport: ws as any } },
    );

    const apps = admin.apps;
    this.firebaseApp = apps.length
      ? (apps[0] as admin.app.App)
      : admin.initializeApp({ credential: this.resolveCredential(config) });
  }

  // Cloud dashboards (Railway, Vercel, ...) have repeatedly mangled the raw
  // multi-line PEM key on copy-paste -- truncation, corrupted newlines, and
  // even a clean base64-of-just-the-key string came out wrong on the other
  // end. Base64-encoding the *entire* service account JSON and parsing it
  // directly removes every manual field-splitting step there was room for
  // transcription to go wrong in. Preferred when set; falls back to
  // FIREBASE_PRIVATE_KEY_BASE64 (key only), then the raw-PEM env var (what
  // local .env already uses).
  private resolveCredential(config: ConfigService): admin.credential.Credential {
    const wholeJson = config.get<string>('FIREBASE_SERVICE_ACCOUNT_BASE64');
    if (wholeJson) {
      const parsed = JSON.parse(Buffer.from(wholeJson.trim(), 'base64').toString('utf8'));
      return admin.credential.cert(parsed);
    }

    return admin.credential.cert({
      projectId: config.getOrThrow('FIREBASE_PROJECT_ID'),
      clientEmail: config.getOrThrow('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.resolvePrivateKey(config),
    });
  }

  private resolvePrivateKey(config: ConfigService): string {
    const b64 = config.get<string>('FIREBASE_PRIVATE_KEY_BASE64');
    if (b64) return Buffer.from(b64.trim(), 'base64').toString('utf8');
    return this.parsePrivateKey(config.getOrThrow('FIREBASE_PRIVATE_KEY'));
  }

  private parsePrivateKey(raw: string): string {
    let key = raw.trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (!key.includes('-----BEGIN')) {
      throw new Error('FIREBASE_PRIVATE_KEY does not look like a PEM key -- check it was copied in full');
    }
    return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
  }

  // Verifies the Firebase ID token the client got from confirming its phone
  // OTP with Firebase Auth, then signs the same phone number into Supabase
  // via the admin API (AuthGuard only accepts Supabase JWTs, not Firebase
  // ones) using a password derived deterministically from the phone number
  // rather than one we'd have to store.
  async signInWithFirebaseToken(idToken: string): Promise<OtpSession> {
    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await this.firebaseApp.auth().verifyIdToken(idToken);
    } catch {
      throw new BadRequestException('Invalid or expired verification');
    }

    const phone = decoded.phone_number;
    if (!phone) throw new BadRequestException('Token has no verified phone number');

    return this.mintSession(phone);
  }

  private async mintSession(phone: string): Promise<OtpSession> {
    const password = this.derivePassword(phone);

    const { error: createErr } = await this.supabase.auth.admin.createUser({
      phone,
      phone_confirm: true,
      password,
    });

    if (createErr) {
      // Most likely "already registered" -- find the existing user and
      // reset their password to our derived value so sign-in below works
      // regardless of what it was set to previously.
      const { data: list, error: listErr } = await this.supabase.auth.admin.listUsers();
      const existing = list?.users.find(u => u.phone === phone.replace(/^\+/, ''));
      if (listErr || !existing) throw new BadRequestException('Could not create or find account for this phone number');

      const { error: updateErr } = await this.supabase.auth.admin.updateUserById(existing.id, { password });
      if (updateErr) throw new BadRequestException('Could not sign in with this phone number');
    }

    const { data: signIn, error: signInErr } = await this.supabase.auth.signInWithPassword({ phone, password });
    if (signInErr || !signIn.session) throw new BadRequestException('Could not sign in with this phone number');

    return { access_token: signIn.session.access_token, refresh_token: signIn.session.refresh_token };
  }

  private derivePassword(phone: string): string {
    return crypto.createHmac('sha256', this.config.getOrThrow('JWT_SECRET')).update(phone).digest('hex');
  }
}
