# Networthia Design System

## Overview
Networthia uses the Observatory visual system: a technical financial dashboard with an astronomy-catalog mood. The interface should feel precise, quiet, dark, and analytical, with dense information, serif display type, mono labels, thin borders, and restrained redshift accents for risk or anomaly states.

## Colors
- Background / Neutral: `#06070C` for the app canvas.
- Surface: `#0D0F17` for panels and controls.
- Surface Soft: `rgba(13, 15, 23, 0.78)` for sticky glass/navigation areas.
- Primary Text: `#E9E3CD` for headings and high-emphasis values.
- Muted Text: `#8D8570` for labels, descriptions, axes, and secondary metrics.
- Accent / Redshift: `#E2563C` for destructive actions, negative anomalies, and urgent attention.
- Positive: `#7FBF8F` for growth and favorable deltas.
- Line: `rgba(233, 227, 205, 0.16)` for borders, separators, chart grid lines.
- Focus: `#E2563C` with low-opacity ring.

## Typography
- Display: `Cormorant Garamond`, medium weight. Use for page titles and major section headings.
- Body: `IBM Plex Sans`, regular. Use for navigation, forms, cards, tables, and paragraph text.
- Label / Numeric Meta: `IBM Plex Mono`, regular. Use for small uppercase labels, currencies, dates, technical meta, and compact status text.
- Avoid oversized dashboard type. Keep headings compact and controlled.

## Shape And Spacing
- Radius small: `2px`.
- Radius medium: `4px`.
- Radius large: `8px`.
- Spacing scale: `8px`, `16px`, `32px`.
- Prefer precise rectangular panels over soft pill-heavy UI.

## Components
- Panels: dark translucent surface, 1px cream-tinted border, subtle shadow, 8px radius.
- Buttons: compact rectangular controls, 4px radius, clear hover border, no large rounded pills.
- Active navigation: cream-tinted surface and border with redshift accent.
- Inputs and selects: dark surface, cream text, muted placeholder, redshift focus ring.
- Badges: small, compact, mono or body text; use color semantically.
- Charts: dark background, muted grid, cream labels, redshift only for risk/negative signals.

## Do's And Don'ts
- Do keep the app dark-only unless a new light system is explicitly designed.
- Do use red sparingly for risk, destructive actions, or selected emphasis.
- Do keep information dense and scan-friendly.
- Do preserve strong contrast for small text and chart tooltips.
- Don't use cyan/teal as the primary brand accent.
- Don't use large pill controls unless the component explicitly benefits from that shape.
- Don't add decorative gradient blobs or soft marketing-style hero sections.
