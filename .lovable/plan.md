

# Radial Menu: Framer Motion Animations + Tooltips

## Changes

### 1. Install framer-motion
Add `framer-motion` as a dependency.

### 2. Rewrite `src/components/layout/RadialMenu.tsx`

**Spring animations** using `motion.div` and `AnimatePresence`:
- **Backdrop**: `motion.div` with opacity fade in/out
- **Each nav item**: `motion(Link)` with spring animation — items fly out from center to their radial position with staggered delays. Use `type: "spring", stiffness: 300, damping: 20` for a bouncy feel. Exit animates back to center.
- **Trigger button**: `motion.button` with `rotate` animation (0° ↔ 90°) and subtle scale pulse

**Tooltip labels** on hover:
- Wrap each icon in a group with a tooltip `<span>` that appears on hover — a small pill label positioned above/below the icon using CSS. Uses `group-hover:opacity-100 group-hover:scale-100` for reveal. This avoids Radix tooltip complexity inside animated elements.

**Trigger stays bottom-center** (already correct in current code).

### File changes

| File | Action |
|------|--------|
| `package.json` | Add `framer-motion` |
| `src/components/layout/RadialMenu.tsx` | Rewrite with `motion` components, spring physics, hover tooltips |

### Key implementation details

```text
- motion(Link) with variants:
  hidden: { x: 0, y: 0, scale: 0, opacity: 0 }
  visible(i): { x, y, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20, delay: i * 0.04 } }
  exit: { x: 0, y: 0, scale: 0, opacity: 0, transition: { duration: 0.2 } }

- Tooltip: relative group wrapper, absolute span with item.name
  positioned via computed angle (top half → below, bottom half → above)
```

