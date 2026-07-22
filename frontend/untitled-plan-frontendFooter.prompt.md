Problem:
The footer component exists, but its information is not visible on the page.

Investigation:
- Footer is rendered in `App.jsx` under the main route layout.
- `Footer.jsx` includes all expected sections: brand, visit, follow, newsletter, legal.
- `Footer.css` is applied, but the footer background and text styling may make content hard to read.
- There is no evidence of `display:none` or `visibility:hidden` on the footer selectors.

Plan:
1. Validate that `Footer` is imported and mounted in `frontend/src/App.jsx`.
2. Confirm `Footer.css` selectors are loaded and not overridden by global or other component styles.
3. Update footer background to a darker, high-contrast color.
4. Ensure footer text and links use visible colors and adequate spacing.
5. Test the app in the browser to verify the footer content appears correctly.
