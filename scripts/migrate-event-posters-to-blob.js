import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

async function runMigration() {
  const { default: dbConnect } = await import("../lib/db.js");
  const { default: Event } = await import("../models/Event.js");
  const { uploadEventPosterFromDataUrl } = await import("../lib/azureBlob.js");

  await dbConnect();

  const events = await Event.find({
    poster: { $type: "string", $regex: /^data:image\// },
  }).select("_id eventName poster");

  if (!events.length) {
    console.log("No base64 event posters found. Nothing to migrate.");
    return;
  }

  console.log(`Found ${events.length} event posters to migrate.`);

  let migrated = 0;
  let failed = 0;

  for (const event of events) {
    try {
      const posterUrl = await uploadEventPosterFromDataUrl(event.poster);
      event.poster = posterUrl;
      await event.save();
      migrated += 1;
      console.log(
        `Migrated poster for event: ${event.eventName} (${event._id})`,
      );
    } catch (error) {
      failed += 1;
      console.error(
        `Failed to migrate poster for event ${event._id}:`,
        error.message,
      );
    }
  }

  console.log(`Migration complete. Migrated: ${migrated}, Failed: ${failed}`);
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Poster migration failed:", error);
    process.exit(1);
  });
