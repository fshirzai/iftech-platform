import { test } from "node:test";
import { strict as assert } from "node:assert";
import { requestInput } from "../src/modules/requests/request.validation.js";

test("accepts a valid project inquiry", () => {
  const result = requestInput.safeParse({
    name: "A Client", email: "client@example.com", projectType: "MIS",
    description: "We need an information system for our organization.",
  });
  assert.equal(result.success, true);
});

test("rejects unexpected properties", () => {
  const result = requestInput.safeParse({
    name: "A Client", email: "client@example.com", projectType: "MIS",
    description: "We need an information system for our organization.", isAdmin: true,
  });
  assert.equal(result.success, false);
});
