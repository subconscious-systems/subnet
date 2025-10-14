ALTER TABLE "agents" ADD COLUMN "username" varchar(255) DEFAULT 'Subnet Admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "fork_ref" integer;--> statement-breakpoint
CREATE INDEX "fork_ref_idx" ON "agents" USING btree ("fork_ref");