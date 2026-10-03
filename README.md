# FEMU website

Source of https://femu-ose.github.io/, the website of
[FEMU](https://github.com/MoatLab/FEMU), an NVMe and CXL SSD emulator for
storage systems research. Built with Docusaurus and deployed to GitHub Pages
on every push to `main`.

```sh
npm ci
npm start        # local preview with hot reload
npm run build    # production build into build/
```

## Where content comes from

- `docs-upstream/` is the FEMU Manual, mirrored from
  [`hw/femu/docs`](https://github.com/MoatLab/FEMU/tree/master/hw/femu/docs)
  at a pinned commit, and the figures in `static/img/manual/` come from the
  manual's PDF build. Each page names its source file and commit. Correct
  these pages in the FEMU repository, not here.
- `docs/`, `blog/` and `src/` are the website's own pages.
- `static/pdf/femu-manual.pdf` is the compiled FEMU Manual.

To report a problem with a page, use its "Edit this page" link, which opens
an issue or the source file in the FEMU repository.

## Licences

See [LICENSE.md](LICENSE.md).
