import { access, writeFile } from "node:fs/promises";

const file = new URL("../next-env.d.ts", import.meta.url);
try {
  await access(file);
} catch {
  await writeFile(
    file,
    [
      '/// <reference types="next" />',
      '/// <reference types="next/image-types/global" />',
      "",
      "// Generated for typecheck when Next has not written this file yet.",
      "",
    ].join("\n"),
  );
}
