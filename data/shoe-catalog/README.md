# Shoe Catalog

Canonical JSON data for every climbing shoe brand tracked by gripkicks. Single source of truth for:

- `scripts/sync-shoe-images.mjs` (ImageKit → Convex sync)
- Future seed/migration tooling
- Admin UI or documentation generators

## File Schema

Each file is `data/shoe-catalog/<brand-key>.json`:

```json
{
  "brand": "La Sportiva",
  "brandKey": "la_sportiva",
  "imagekitFolder": "gripkicks/imgs/shoes/lasportiva/",
  "filenameToName": {
    "solutioncomp": "Solution Comp",
    "tcpro": "TC Pro"
  },
  "shoes": [
    {
      "name": "Solution",
      "aggressiveness": "aggressive",
      "stiffness": "stiff",
      "climbingDiscipline": "bouldering",
      "volume": "medium",
      "footShapeCompat": ["egyptian", "roman"]
    }
  ]
}
```

### Fields

- **brand** (required): display name shown in the database/UI.
- **brandKey** (required): snake_case key, matches the filename.
- **imagekitFolder** (required): ImageKit path where images for this brand live. Use empty string `""` for brands with no uploaded images yet.
- **filenameToName** (optional): explicit mapping from image filename slug (pre `_m1/_w1/_k1` suffix) to canonical shoe name. Use when auto-matching fails.
- **shoes** (required, can be empty): array of shoe entries with attributes.

### Shoe attributes (enums)

- **aggressiveness**: `flat` | `moderate` | `aggressive`
- **stiffness**: `soft` | `medium` | `stiff`
- **climbingDiscipline**: `gym` | `sport` | `trad` | `bouldering` | `competition`
- **volume**: `low` | `medium` | `high`
- **footShapeCompat**: subset of `["egyptian", "roman", "greek", "germanic", "celtic"]`

## Workflow

1. Add or edit a brand JSON file.
2. (Once images uploaded) run `node scripts/sync-shoe-images.mjs <brand-key> --dry-run`.
3. If it looks right: `node scripts/sync-shoe-images.mjs <brand-key>`.

## Image Filename Convention

`<slug>_<m|w|k|u><N>.<ext>` — `m`=men, `w`=women, `k`=kids, `u`=unisex. Gender suffixes (Women's / Kids) are applied automatically when a `_w*` or `_k*` image is detected.

## Status Per Brand

Brands marked **populated** have verified model lists. Brands marked **skeleton** have empty `shoes` arrays and need manual research/fill-in before their images can meaningfully sync.
