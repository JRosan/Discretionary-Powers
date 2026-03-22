import { db } from "./index";
import { ministries, users } from "./schema";
import { hash } from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Insert ministries
  const ministryData = [
    { name: "Ministry of Finance", code: "FIN" },
    {
      name: "Ministry of Natural Resources, Labour and Immigration",
      code: "NAT",
    },
    {
      name: "Ministry of Education, Culture, Youth Affairs and Sports",
      code: "EDU",
    },
    { name: "Ministry of Health and Social Development", code: "HEA" },
    { name: "Ministry of Communications and Works", code: "COM" },
    { name: "Premier's Office", code: "PMO" },
  ] as const;

  const insertedMinistries = await db
    .insert(ministries)
    .values([...ministryData])
    .onConflictDoNothing({ target: ministries.code })
    .returning();

  console.log(`Ministries: ${insertedMinistries.length} created`);

  // Look up ministry IDs for user assignment
  const allMinistries = await db.select().from(ministries);
  const ministryByCode = Object.fromEntries(
    allMinistries.map((m) => [m.code, m.id])
  );

  // Insert demo users
  const passwordHash = await hash("password", 12);

  const userData = [
    {
      email: "minister@gov.vg",
      name: "Minister",
      role: "minister" as const,
      ministryId: ministryByCode["FIN"],
      passwordHash,
    },
    {
      email: "secretary@gov.vg",
      name: "Permanent Secretary",
      role: "permanent_secretary" as const,
      ministryId: ministryByCode["FIN"],
      passwordHash,
    },
    {
      email: "legal@gov.vg",
      name: "Legal Advisor",
      role: "legal_advisor" as const,
      ministryId: ministryByCode["PMO"],
      passwordHash,
    },
    {
      email: "auditor@gov.vg",
      name: "Auditor",
      role: "auditor" as const,
      ministryId: ministryByCode["PMO"],
      passwordHash,
    },
    {
      email: "admin@gov.vg",
      name: "Admin",
      role: "permanent_secretary" as const,
      ministryId: ministryByCode["PMO"],
      passwordHash,
    },
  ];

  const insertedUsers = await db
    .insert(users)
    .values(userData)
    .onConflictDoNothing({ target: users.email })
    .returning();

  console.log(`Users: ${insertedUsers.length} created`);
  console.log("Seed complete.");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
