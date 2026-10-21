import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const stylesheet = await readFile(
  new URL("../src/styles/phone/themes.css", import.meta.url),
  "utf8",
);
function declarations(selector) {
  const start = stylesheet.indexOf(selector + " {");
  assert.notEqual(start, -1, `Missing palette: ${selector}`);
  const block = stylesheet.slice(start, stylesheet.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/--phone-([a-z-]+):\s*(#[a-f\d]{6});/gi)].map(
      (match) => [match[1], match[2]],
    ),
  );
}
const base = declarations(".phone-theme");

function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((channel) => parseInt(channel, 16) / 255);
  const linear = rgb.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

const pairs = [
  ["text", "canvas"],
  ["text", "surface"],
  ["text", "surface-raised"],
  ["muted", "canvas"],
  ["muted", "surface"],
  ["muted", "surface-raised"],
  ["accent", "accent-soft"],
  ["accent", "surface"],
  ["success", "success-soft"],
  ["danger", "danger-soft"],
  ["warning", "warning-soft"],
  ["info", "info-soft"],
  ["slate", "slate-soft"],
  ["on-accent", "info"],
  ["on-accent", "slate"],
  ["on-accent", "warning"],
  ["on-accent", "accent"],
  ["on-accent", "success"],
  ["on-accent", "danger"],
];

for (const theme of ["twilight", "aureline", "agency"]) {
  test(`${theme}: phone text and action labels meet WCAG AA contrast`, () => {
    const palette =
      theme === "twilight"
        ? base
        : {
            ...base,
            ...declarations(`.phone-theme[data-phone-theme='${theme}']`),
          };
    for (const [foreground, background] of pairs) {
      assert.ok(
        palette[foreground] && palette[background],
        `Missing ${foreground} / ${background}`,
      );
      const levels = [
        luminance(palette[foreground]),
        luminance(palette[background]),
      ].sort((a, b) => b - a);
      const contrast = (levels[0] + 0.05) / (levels[1] + 0.05);
      assert.ok(
        contrast >= 4.5,
        `${theme} ${foreground} on ${background}: ${contrast.toFixed(2)}:1, expected 4.5:1`,
      );
    }
  });
}
