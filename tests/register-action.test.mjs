import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../app/register/actions/register.action.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function load(signUp) {
  const exports = {};
  new Function("require", "exports", compiled)(name => name === "@/lib/supabase" ? { supabase: { auth: { signUp } } } : {}, exports);
  return exports.registerAction;
}

test("registration reports a previously registered email without exposing provider errors", async () => {
  const action = load(async () => ({ data: { user: { identities: [] }, session: null }, error: null }));
  const result = await action({ name: "Jermy", email: "jermy@example.com", password: "Password1!" });
  assert.deepEqual(result, { success: false, alreadyRegistered: true, error: "Akun sudah terdaftar. Silakan masuk ke akun Anda." });
});
