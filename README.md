# The Leatherwood Ledger

A static, single-page public records site presenting every campaign finance
filing submitted by Rep. Tom Leatherwood (TN House District 99) to the
Tennessee Registry of Election Finance, 2018 through 2026.

All data is baked into `data.js` at build time. There is no backend, no
database, and no API keys. It is pure HTML/CSS/JS and can be hosted anywhere
that serves static files.

## What's in it

- **Hero receipt**: his top 2024/2026-cycle special-interest donors rendered
  as an itemized receipt with a PAID IN FULL stamp
- **Exhibit A**: contributions by source per cycle, plus the PAC-share
  trendline (57% → 74% → 87% → 100%)
- **Exhibit B**: career split and top special interests
- **Exhibit C**: all 390 itemized checks, searchable and filterable by cycle
  and source type, sortable columns
- **Exhibit D**: the full 30-report ledger with the balance-over-time chart
- **Exhibit E**: the eight individual donors of the last two cycles
- **Methodology**: sources, classification rules, correction policy

## File structure

```
index.html    page structure
styles.css    all styling
app.js        charts, table logic, receipt render
data.js       the full dataset (generated from TREF exports)
render.yaml   Render deploy config
```

## Deploy: GitHub + Render

1. Create a new GitHub repository and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial: Leatherwood TREF ledger site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/leatherwood-ledger.git
   git push -u origin main
   ```
2. In Render (render.com): **New → Static Site**, connect the repo.
   - Build command: *(leave empty)*
   - Publish directory: `.`
   Render will auto-detect `render.yaml` if present.
3. Every `git push` to `main` redeploys automatically.
4. Optional: add a custom domain in Render's settings (e.g., a subdomain of
   the campaign site).

## Updating the data

When Leatherwood files a new report (2nd Quarter 2026 is due in July,
Pre-Primary in late July), export it from
https://apps.tn.gov/tncamp/ as Excel, and regenerate `data.js` with the
parsing pipeline (or hand the export back to Claude to regenerate).

## IMPORTANT: before publishing

1. **Disclaimer.** Tennessee law (T.C.A. § 2-19-120) requires "Paid for by"
   identification on campaign communications. If this site is paid for or
   coordinated with a candidate's committee, replace the placeholder in the
   footer of `index.html` with the proper disclaimer (committee name and
   treasurer) BEFORE the site goes live. Confirm the exact required wording
   with the campaign's compliance counsel or the Registry.
2. **Accuracy.** Every figure traces to a specific TREF filing. If you edit
   any number by hand, re-verify it against the source report first.
3. **The Pre-General 2018 gap.** The donor explorer excludes that one
   report's $14,125 in itemized contributions (export pending). The ledger
   totals include it. This is disclosed in the site's methodology section;
   keep that disclosure if you edit the page.

## Data source

Tennessee Registry of Election Finance, committee ID 7320,
https://apps.tn.gov/tncamp/ — exported July 3, 2026.
