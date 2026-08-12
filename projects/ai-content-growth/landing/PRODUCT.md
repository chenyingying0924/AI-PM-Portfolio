# BrandPilot AI · Landing Page Product Model

## Register

Brand page for a commercial B2B AI SaaS product. Design leads with product value, not spectacle.

## Locked Direction

- Near-black graphite base with fine grain and a restrained violet-blue signal.
- The signal appears only where the Agent is working: run status, generation state, quality gate.
- Real product screenshots from the Agent prototype are the only product imagery.
- English copy, plain and specific, no marketing buzzwords.

## Component System

- `src/components/ui.js`: Button, Container, Pill, SectionHead, GlassPanel, LogoMark.
- `src/sections/*.js`: Nav, Hero, Problem, Workflow, Capabilities, Metrics, Pricing, CTA, Footer.
- Motion lives in `src/motion.js` and is gated behind reduced motion.

## Extension Points

- Dashboard page can reuse `GlassPanel`, `Pill`, and the token layer.
- Agent workflow page can reuse `WorkflowStep` data and the screenshot language.
- New routes only add sections under `src/sections` and mount them in `App.js`.
