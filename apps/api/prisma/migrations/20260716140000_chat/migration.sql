-- Phase 8, Part B: 1:1 direct messaging between a buyer/homeowner and a
-- provider/seller (contractors, labour, service experts, property sellers).
-- userAId is always the lexicographically smaller participant ID (enforced
-- in ChatService), so the unique constraint on (user_a_id, user_b_id)
-- catches both orderings of the same pair.

CREATE TABLE "conversations" (
  "id" TEXT NOT NULL,
  "user_a_id" TEXT NOT NULL,
  "user_b_id" TEXT NOT NULL,
  "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversations_user_a_id_user_b_id_key" ON "conversations"("user_a_id", "user_b_id");

CREATE TABLE "messages" (
  "id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "sender_id" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- New tables created after the Security Phase 1 RLS lockdown — need their
-- own enable + grant revoke to stay deny-by-default for anon/authenticated.
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "conversations" FROM anon;
REVOKE ALL ON "conversations" FROM authenticated;

ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "messages" FROM anon;
REVOKE ALL ON "messages" FROM authenticated;
