# AI Prompt for Lovable - ARCline Frontend Website

Build a mobile-responsive frontend website for the ARCline project - a multi-hotline voice system for the ARC Raiders universe. The website should be built using modern web technologies (React/Next.js recommended) and styled to match the aesthetic of arcraiders.com.

## Core Requirements

### 1. Hero Section - Hotline Phone Number

- Display the hotline phone number prominently at the top of the page
- Phone number: **+1 (872) 282-LINE** or **+1 872 282 5463**
- Make it large, eye-catching, and the focal point of the hero section
- Include a brief explanation that this is a hotline to call

### 2. Features List Section

Below the phone number, display a list of features available when calling the hotline:

- **Extraction Request** - Request extractions from your location
- **Loot Locator** - Search for valuable items
- **Scrappy's Chicken Line** - Fun sound clips and randomizers
- **Submit Intel** - Share faction intel and rumors
- **Listen to Intel** - Hear the latest verified faction news

### 3. Scrappy Messages Section

- Display messages from the `scrappy_messages` database table
- Only show messages where `verified = true`
- Include imagery of a 1980s-style answering machine (vintage/retro aesthetic)
- The answering machine should be visually prominent and styled to look like an old-school messaging machine from the 1980s
- Display messages in a format that fits the answering machine theme (e.g., message cards, tape-style display, etc.)
- Show message content, timestamp, and any other relevant fields

### 4. Intel Submissions Section

- Display intel from the `intel` database table
- Filter criteria: `faction = 'rate of report'` AND `verified = true`
- Display intel content, timestamp, and any other relevant fields
- Style this section to complement the overall design

### 5. Navigation Bar

Create a main navigation bar with the following links:

- **GitHub Repository**: https://github.com/jasonrundell/arcline
- **Jason Rundell's Website**: https://jasonrundell.com (developer credit)
- **Twilio Hotline Contest**: Link to the Twilio Hotline Contest (you may need to find the correct URL)

### 6. Design Specifications

#### Color Palette

Match the color palette from arcraiders.com as closely as possible. Visit the site to extract exact colors, but typical colors for such sites include:

- Primary dark colors (blacks, dark grays)
- Accent colors (oranges, reds, or other vibrant colors)
- Background colors
- Text colors

#### Typography

Match the fonts used on arcraiders.com. Common fonts for gaming/tech sites include:

- Modern sans-serif fonts
- Possibly monospace for technical elements
- Bold, readable fonts for headings

#### Overall Aesthetic

- Dark, futuristic/gaming aesthetic
- Clean, modern design
- Professional yet engaging
- Consistent with ARC Raiders universe theme

### 7. Mobile Responsiveness

- Ensure the website is fully responsive
- Test on mobile, tablet, and desktop viewports
- Navigation should work well on all screen sizes
- Content should reflow appropriately
- Touch-friendly buttons and links on mobile

### 8. Database Integration

- Connect to Supabase database
- Use environment variables for Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Create API routes or use Supabase client directly to fetch:
  - Scrappy messages where `verified = true`
  - Intel where `faction = 'rate of report'` AND `verified = true`
- Handle loading states and errors gracefully
- Display empty states when no data is available

### 9. Technical Stack Recommendations

- **Framework**: Next.js 14+ (App Router recommended)
- **Styling**: Tailwind CSS or similar utility-first CSS framework
- **Database**: Supabase client library
- **Deployment**: Vercel (recommended for Next.js)

### 10. Additional Features

- Add smooth scrolling and transitions
- Include hover effects on interactive elements
- Ensure good accessibility (ARIA labels, semantic HTML)
- Optimize images and assets for performance
- Add meta tags for SEO

## Database Schema Reference

### scrappy_messages table

- `id` (UUID)
- `content` (TEXT)
- `faction` (TEXT, optional)
- `verified` (BOOLEAN)
- `created_at` (TIMESTAMP)

### intel table

- `id` (UUID)
- `content` (TEXT)
- `faction` (TEXT, optional)
- `verified` (BOOLEAN)
- `created_at` (TIMESTAMP)

## Implementation Notes

1. The answering machine imagery for the Scrappy messages section should be a key visual element - consider using SVG illustrations, CSS art, or carefully selected stock images that match the 1980s aesthetic.

2. When fetching data, ensure proper error handling and loading states. Show skeleton loaders or spinners while data is being fetched.

3. The color palette and fonts should be extracted from arcraiders.com by visiting the site. If exact colors cannot be determined, use a dark theme with orange/red accents typical of gaming/tech sites.

4. Make sure all external links open in new tabs (target="\_blank" with rel="noopener noreferrer").

5. Consider adding a footer with additional information or links if appropriate.

6. The website should feel cohesive with the ARC Raiders universe theme - futuristic, tactical, and engaging.

## Success Criteria

- Hotline number is prominently displayed at the top
- All features are clearly listed
- Scrappy messages display correctly with 1980s answering machine imagery
- Intel submissions display correctly with proper filtering
- Navigation bar includes all required links
- Design matches arcraiders.com color palette and fonts
- Website is fully mobile responsive
- Database integration works correctly
- Site loads quickly and performs well
- No console errors or warnings
