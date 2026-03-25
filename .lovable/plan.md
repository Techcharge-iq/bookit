

# Radial Menu: Center-Bottom Trigger, Center-Screen Icons-Only Expansion

## Changes — single file: `src/components/layout/RadialMenu.tsx`

### 1. Move trigger button to bottom-center
Change the container from `fixed bottom-6 right-6` to `fixed bottom-6 left-1/2 -translate-x-1/2` so the FAB sits at the horizontal center of the screen.

### 2. Open icons in screen center (not relative to button)
When open, position nav items in a circle around the **center of the viewport** instead of around the trigger button. Use a separate `fixed` container centered on screen (`inset-0 flex items-center justify-center`) that holds all the radial items. Each item positioned with absolute + transform from center using a full 360° circle distribution (evenly spaced: `index * (360 / 9)` degrees, radius ~120px).

### 3. Icons only — remove text labels
Remove the `<span>` with `item.name` beneath each icon. Add a `title` attribute on each Link for tooltip on hover. Keep icon circles at `h-12 w-12`.

### 4. Remove the broken inline `<style>` block
The current CSS custom property approach (`--tx`, `--ty`) doesn't work properly. Replace with direct inline `transform` values computed in JS — no media query needed since we use a single radius for the centered layout.

### Layout Summary
```text
┌─────────────────────────────┐
│                             │
│         ○  ○  ○             │
│       ○        ○            │
│       ○        ○            │  ← icons in 360° circle
│         ○  ○               │     at viewport center
│                             │
│                             │
│          [FAB]              │  ← bottom center
└─────────────────────────────┘
```

