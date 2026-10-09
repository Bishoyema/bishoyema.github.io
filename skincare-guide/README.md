# Skincare Science Essentials

**[Skincare-Science-Essentials.pdf](Skincare-Science-Essentials.pdf)**: a 15-page A4 training booklet in Arabic with English terms, written for Beauty Advisors.
It covers skin anatomy, skin types, what skin needs, 27 active ingredients, ceramides, problems and solutions, routines, a quick reference, and references.

## Edit and rebuild

The booklet is plain HTML and CSS in `src/`:

- `src/guide.html` holds the page layouts. The ingredient cards, the 25-term table and the bilingual examples come from data arrays in the `<script>` at the end of the file.
- `src/style.css` holds the design: the palette (white, soft beige, sage green, dark navy), the typography and the components.

Rebuild the PDF with headless Chromium (needs the `playwright` package):

```bash
node skincare-guide/build.mjs
```

The build fails if any page's content runs past its bottom margin.

## Fonts

The PDF uses [Cairo](https://fonts.google.com/specimen/Cairo) for Arabic, [Inter](https://fonts.google.com/specimen/Inter) for English, and [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) for the cover title. All three are under the SIL Open Font License (see `src/fonts/OFL-*.txt`). `src/fonts/` holds static instances of the variable fonts, so the PDF embeds standard TrueType fonts.
