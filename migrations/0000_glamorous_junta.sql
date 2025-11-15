CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"propal_id" text,
	"date_envoi" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "propals" (
	"id" text PRIMARY KEY NOT NULL,
	"titre" text NOT NULL,
	"contenu_json" jsonb NOT NULL,
	"date_creation" timestamp with time zone DEFAULT now() NOT NULL,
	"date_modification" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_propal_id_propals_id_fk" FOREIGN KEY ("propal_id") REFERENCES "public"."propals"("id") ON DELETE no action ON UPDATE no action;