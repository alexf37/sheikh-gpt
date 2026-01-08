# Agent Instructions

## ModifyWithAI Element IDs

When creating or modifying React/JSX elements, ALWAYS add a `data-mwai-id` attribute with a descriptive kebab-case identifier. This is required for ModifyWithAI to identify and modify elements.

### Guidelines

1. **Be descriptive**: Use names that clearly describe what the element is or does
2. **Use kebab-case**: Separate words with hyphens (e.g., `hero-section`, `contact-form`)
3. **Include context**: If there are multiple similar elements, include distinguishing context (e.g., `pricing-card-basic`, `pricing-card-pro`)
4. **Cover all elements**: Add IDs to headings, paragraphs, buttons, images, sections, cards, forms, inputs, navigation items, etc.

### Examples

```tsx
<header data-mwai-id="main-header">...</header>
<nav data-mwai-id="primary-navigation">...</nav>
<section data-mwai-id="hero-section">...</section>
<div data-mwai-id="pricing-card-pro">...</div>
<button data-mwai-id="submit-contact-form">Submit</button>
<h1 data-mwai-id="page-title">Welcome</h1>
<p data-mwai-id="feature-description">...</p>
<footer data-mwai-id="site-footer">...</footer>
```
