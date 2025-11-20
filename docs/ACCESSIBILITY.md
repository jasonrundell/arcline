# Accessibility Guide

ARC Line is designed to meet WCAG 2.1 AA standards.

## Color Contrast

All text meets minimum contrast ratios:

- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: Clear focus indicators

## Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Focus indicators are visible (cyan outline)
- Skip links available where needed

## Screen Reader Support

- Semantic HTML elements used throughout
- ARIA labels for icon-only buttons
- Descriptive link text
- Proper heading hierarchy (h1 → h2 → h3)

## Focus Management

- Visible focus indicators on all interactive elements
- Focus trap in modals (if added)
- Focus restoration after actions

## Testing Accessibility

### Automated Testing

Use axe DevTools or Lighthouse:

```bash
npm run build
npm start
# Run Lighthouse audit
```

### Manual Testing

1. **Keyboard Navigation**

   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test Enter/Space activation

2. **Screen Reader**

   - Test with NVDA (Windows) or VoiceOver (Mac)
   - Verify all content is announced
   - Check form labels and error messages

3. **Color Contrast**
   - Use WebAIM Contrast Checker
   - Test with color blindness simulators
   - Verify text is readable in all themes

## Implementation Details

### Components

All components include:

- Proper semantic HTML
- ARIA attributes where needed
- Keyboard event handlers
- Focus management

### Forms

- Labeled inputs
- Error messages associated with inputs
- Required field indicators
- Clear validation feedback

### Images

- Alt text for all images
- Decorative images marked with empty alt
- Icons have ARIA labels

## Future Improvements

- Add skip navigation links
- Implement focus trap for modals
- Add live regions for dynamic content
- Enhance error announcements
