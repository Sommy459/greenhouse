# Catalogue menu decorations

The two craft-paper photos (paper cups, wooden cutlery and a fern) tucked into the corners of the Figma catalogue
dropdown. Export each at 2x as a **PNG with a transparent background** and save it here:

| File | Corner | Size on screen |
|---|---|---|
| `catalogue-corner-top.png` | top-right | about 42×50 |
| `catalogue-corner-bottom.png` | bottom-left | about 48×55 |

Used by `CatalogueMenu` and `HeaderMenu` (the desktop ☰, bottom-left only, shown smaller) in
`src/components/layouts/StoreHeader.tsx`. Until a file exists, its corner is simply empty.
