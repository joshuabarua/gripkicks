import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { buildImagePlan, extractCandidates, sha256, shoeSlug, validateImagePaths, verifyTransparentImage } from "./shoe-image-utils.mjs";

const shoe = { brand: "Scarpa", name: "Drago LV", status: "approved", imageUrl: "https://ik.imagekit.io/example/drago_lv.png" };

test("plus variants have distinct paths and collisions are rejected", () => {
  assert.equal(shoeSlug("Rock"), "rock");
  assert.equal(shoeSlug("Rock+"), "rock_plus");
  const shoes = [{ brand: "Simond", name: "Rock", brandKey: "simond", slug: "rock" }, { brand: "Simond", name: "Rock+", brandKey: "simond", slug: "rock" }];
  assert.throws(() => validateImagePaths(shoes), /Image path collision/);
  shoes[1].slug = shoeSlug(shoes[1].name);
  assert.doesNotThrow(() => validateImagePaths(shoes));
});

test("only approved, exact model matches can be planned", () => {
  const current = [{ _id: "lv", brand: "Scarpa", name: "Drago LV" }, { _id: "regular", brand: "Scarpa", name: "Drago" }];
  const plan = buildImagePlan([shoe, { ...shoe, status: "needs_review" }], current);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].existing._id, "lv");
  assert.equal(plan[0].preserve, false);
  assert.throws(() => buildImagePlan([shoe], current.slice(1)), /exact database match/);
  assert.throws(() => buildImagePlan([shoe], [current[0], current[0]]), /exact database match/);
});

test("existing images are preserved and production requires verified dev work", () => {
  const current = [{ ...shoe, _id: "lv", imageUrl: "https://existing.example/shoe.png" }];
  assert.equal(buildImagePlan([shoe], current, true)[0].preserve, true);
  assert.throws(() => buildImagePlan([shoe], [{ ...current[0], imageUrl: "" }], true), /Dev verification required/);
  assert.equal(buildImagePlan([{ ...shoe, devVerified: true }], [{ ...current[0], imageUrl: "  " }], true)[0].preserve, false);
});

test("candidate extraction prefers side views and rejects charts and non-web URLs", () => {
  const html = `<script type="application/ld+json">{"@type":"Product","image":["/drago-lv-top.jpg","/drago-lv-side.png"]}</script><img src="/drago-lv-side.png"><img src="/shoe-size-chart.jpg"><img src="file:///shoe.png"><img src="/logo.png">`;
  const candidates = extractCandidates(html, "https://manufacturer.example/product", shoe);
  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].url, "https://manufacturer.example/drago-lv-side.png");
});

test("archived HTTP image references use HTTPS and manufacturer media APIs are supported", () => {
  const html = `<img data-src="http://weighmyrack.com/images/shoe/drago_lv.jpg?itok=abc"><img src="https://shopapi.edelrid.com/v1/media/image/redchili/123/web-s">`;
  const candidates = extractCandidates(html, "https://weighmyrack.com/shoe/drago", shoe);
  assert.equal(candidates.length, 2);
  assert.ok(candidates.every((candidate) => candidate.url.startsWith("https://")));
});

test("transparent-image verification rejects opaque, empty, and altered files", async () => {
  const opaque = await sharp({ create: { width: 300, height: 200, channels: 4, background: "white" } }).png().toBuffer();
  const empty = await sharp({ create: { width: 300, height: 200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
  const foreground = await sharp({ create: { width: 180, height: 80, channels: 4, background: "black" } }).png().toBuffer();
  const transparent = await sharp(empty).composite([{ input: foreground, left: 60, top: 60 }]).png().toBuffer();
  await assert.rejects(verifyTransparentImage(opaque), /transparent background/);
  await assert.rejects(verifyTransparentImage(empty), /shoe foreground/);
  await assert.rejects(verifyTransparentImage(transparent, sha256(opaque)), /reviewed asset/);
  assert.deepEqual(await verifyTransparentImage(transparent, sha256(transparent)), { width: 300, height: 200, transparentPixels: 0.76 });
});
