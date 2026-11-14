import assert from "node:assert/strict";
import test from "node:test";
import { POST as openAccount } from "../../app/api/closepath/open/route";
import { POST as signIn } from "../../app/api/closepath/sign-in/route";
import { POST as signOut } from "../../app/api/closepath/sign-out/route";
import { PUT as saveBook } from "../../app/api/closepath/workspace/route";
import { memoryStore, setClosepathStore } from "../../lib/closepath-store";
import { emptyFile, emptyWorkspace } from "../../lib/closepath-model";
import { bindTestStripe } from "../bind-stripe";
import { TEST_EMAIL, TEST_ORIGIN, TEST_PASSWORD, TEST_SESSION_ID } from "../constants";
import { cookieHeader, formRequest, withCookie } from "./http";

let mock: Awaited<ReturnType<typeof bindTestStripe>>;

test.before(async () => {
  mock = await bindTestStripe();
  setClosepathStore(memoryStore());
});

test.after(async () => {
  setClosepathStore(null);
  await mock.unbind();
});

test("checkout opens an account, sign-in returns, and the book can be saved", async () => {
  const opened = await openAccount(
    formRequest("/api/closepath/open", {
      session_id: TEST_SESSION_ID,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      confirm: TEST_PASSWORD,
    }),
  );
  assert.equal(opened.status, 303);
  assert.equal(opened.headers.get("location"), `${TEST_ORIGIN}/closepath`);
  const cookie = cookieHeader(opened);
  assert.equal(cookie.includes("closepath_session="), true);

  const wrong = await signIn(
    formRequest("/api/closepath/sign-in", { email: TEST_EMAIL, password: "not-the-password" }),
  );
  assert.equal(wrong.status, 303);
  assert.equal(wrong.headers.get("location"), `${TEST_ORIGIN}/closepath/sign-in?error=invalid`);

  const signedIn = await signIn(
    formRequest("/api/closepath/sign-in", { email: TEST_EMAIL, password: TEST_PASSWORD }),
  );
  assert.equal(signedIn.status, 303);
  assert.equal(signedIn.headers.get("location"), `${TEST_ORIGIN}/closepath`);
  const session = cookieHeader(signedIn);

  const file = emptyFile("file_test_e2e");
  file.address = "18 Test Street";
  const book = { ...emptyWorkspace(), files: [file] };
  const save = await saveBook(
    withCookie(
      new Request(`${TEST_ORIGIN}/api/closepath/workspace`, {
        method: "PUT",
        headers: {
          host: "127.0.0.1:3210",
          origin: TEST_ORIGIN,
          "content-type": "application/json",
        },
        body: JSON.stringify(book),
      }),
      session,
    ),
  );
  assert.equal(save.status, 200);
  assert.deepEqual(await save.json(), { ok: true });

  const signedOut = await signOut(withCookie(formRequest("/api/closepath/sign-out"), session));
  assert.equal(signedOut.status, 303);
  assert.equal(signedOut.headers.get("location"), `${TEST_ORIGIN}/closepath/sign-in`);
  const cleared = cookieHeader(signedOut);
  assert.equal(cleared.includes("closepath_session="), true);
});

test("a short password does not open an account", async () => {
  const response = await openAccount(
    formRequest("/api/closepath/open", {
      session_id: TEST_SESSION_ID,
      email: "other@example.com",
      password: "short",
      confirm: "short",
    }),
  );
  assert.equal(response.status, 303);
  const location = response.headers.get("location") ?? "";
  assert.equal(location.includes("error=short"), true);
});
